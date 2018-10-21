test('has prompts with defaults', () => {
  const prompts = require('../prompts')({})
  const configQ = prompts.find((question) => question.name === 'config')
  const specsQ = prompts.find((question) => question.name === 'specs')
  const baseUrlQ = prompts.find((question) => question.name === 'baseUrl')
  const capabilitiesQ = prompts.find((question) => question.name === 'capabilities')
  const headlessQ = prompts.find((question) => question.name === 'headless')
  const debugQ = prompts.find((question) => question.name === 'debug')

  expect(prompts).toBeInstanceOf(Array)
  expect(configQ.default).toBeUndefined
  expect(specsQ.default).toEqual('test/spec/**')
  expect(baseUrlQ.default).toBeUndefined
  expect(capabilitiesQ.default).toEqual('desktop')
  expect(headlessQ.default).toBeFalsey
  expect(debugQ.default).toBeFalsey
})
