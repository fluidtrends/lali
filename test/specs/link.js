const path = require('path')
const savor = require('savor')
const fs = require('fs-extra')
const link = savor.src('link')
const got = require('got')
const Readable = require('stream').Readable

savor.add('check if a link exists', (context, done) => {
  // Create a mock
  context.stub(got, 'head', () => Promise.resolve())

  savor.promiseShouldSucceed(link('test').exists(), done, () => {
    got.head.restore()
  })
})

.add('detect if an invalid link does not exist', (context, done) => {
  // Create a mock
  context.stub(got, 'head', () => Promise.reject(new Error('mock error')))

  savor.promiseShouldFail(link().exists(), done, (error) => {
    context.expect(error).to.exist
    got.head.restore()
  })
})

.add('detect if a link does not exist', (context, done) => {
  // Create a mock
  context.stub(got, 'head', () => Promise.reject(new Error('mock error')))

  savor.promiseShouldFail(link('test').exists(), done, (error) => {
    context.expect(error.message).to.equal('mock error')
    got.head.restore()
  })
})

.add('fail to download a link', (context, done) => {
  context.stub(got, 'stream', () => ({
    pipe: () => ({
      pipe: () => ({
        on: () => ({
          on: (type) => {
            throw new Error('mock error')
          }
        })
      })
    })
  }))

  savor.promiseShouldFail(link().download(context.dir), done, (error) => {
    // Make sure the content was uncompressed
    context.expect(error.message).to.equal('mock error')
    got.stream.restore()
  })
})

.add('successfully install a link', (context, done) => {
  // Create a mock stream
  savor.addAsset('assets/link.tar.gz', 'link.tar.gz', context)
  const file = path.join(context.dir, 'link.tar.gz')
  context.expect(fs.existsSync(file)).to.be.true
  const stream = fs.createReadStream(file)
  context.stub(got, 'stream', () => stream)

  // Prepare to download to a fresh temporary location
  const destTestFile = path.join(context.dir, 'test.json')
  context.expect(fs.existsSync(destTestFile)).to.be.false

  savor.promiseShouldSucceed(link(file).install(context.dir), done, () => {
    // Make sure the content was uncompressed
    context.expect(fs.existsSync(destTestFile)).to.be.true
    got.stream.restore()
    stream.close()
  })
})

.run('link')
