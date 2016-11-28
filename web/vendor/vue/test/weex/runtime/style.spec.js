import {
  compileAndStringify,
  prepareRuntime,
  resetRuntime,
  createInstance
} from '../helpers/index'

describe('generate style', () => {
  let runtime

  beforeAll(() => {
    runtime = prepareRuntime()
  })

  afterAll(() => {
    resetRuntime()
    runtime = null
  })

  it('should be generated', () => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text style="font-size: 100">Hello World</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        { type: 'text', style: { fontSize: '100' }, attr: { value: 'Hello World' }}
      ]
    })
  })

  it('should be generated by array binding', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text :style="[x, y]" @click="foo">Hello {{z}}</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: { fontSize: 100, color: '#00ff00' },
          y: { color: '#ff0000', fontWeight: 'bold' },
          z: 'World'
        },
        methods: {
          foo: function () {
            this.x.fontSize = 200
            this.x.color = '#0000ff'
            Vue.delete(this.y, 'fontWeight')
            this.z = 'Weex'
          }
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        {
          type: 'text',
          event: ['click'],
          style: { fontSize: 100, color: '#ff0000', fontWeight: 'bold' },
          attr: { value: 'Hello World' }
        }
      ]
    })

    instance.$fireEvent(instance.doc.body.children[0].ref, 'click', {})
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [
          {
            type: 'text',
            event: ['click'],
            style: { fontSize: 200, color: '#ff0000', fontWeight: '' },
            attr: { value: 'Hello Weex' }
          }
        ]
      })
      done()
    })
  })

  it('should be generated by map binding', (done) => {
    const { render, staticRenderFns } = compileAndStringify(`
      <div>
        <text :style="{ fontSize: x, color: '#00ff00' }" @click="foo">Hello</text>
        <text :style="y">{{z}}</text>
      </div>
    `)
    const instance = createInstance(runtime, `
      new Vue({
        data: {
          x: 100,
          y: { color: '#ff0000', fontWeight: 'bold' },
          z: 'World'
        },
        methods: {
          foo: function () {
            this.x = 200
            this.y.color = '#0000ff'
            Vue.delete(this.y, 'fontWeight')
            this.z = 'Weex'
          }
        },
        render: ${render},
        staticRenderFns: ${staticRenderFns},
        el: 'body'
      })
    `)
    expect(instance.getRealRoot()).toEqual({
      type: 'div',
      children: [
        {
          type: 'text',
          event: ['click'],
          style: { fontSize: 100, color: '#00ff00' },
          attr: { value: 'Hello' }
        },
        {
          type: 'text',
          style: { color: '#ff0000', fontWeight: 'bold' },
          attr: { value: 'World' }
        }
      ]
    })

    instance.$fireEvent(instance.doc.body.children[0].ref, 'click', {})
    setTimeout(() => {
      expect(instance.getRealRoot()).toEqual({
        type: 'div',
        children: [
          {
            type: 'text',
            event: ['click'],
            style: { fontSize: 200, color: '#00ff00' },
            attr: { value: 'Hello' }
          },
          {
            type: 'text',
            style: { color: '#0000ff', fontWeight: '' },
            attr: { value: 'Weex' }
          }
        ]
      })
      done()
    })
  })
})
