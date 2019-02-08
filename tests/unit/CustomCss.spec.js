import {mount} from '@vue/test-utils';
import Renderer from '../../src/components/vue-form-renderer';

describe('Test custom css', () => {

  // Now mount the component and you have the wrapper
  const wrapper = mount(Renderer, {
    sync: false,
    propsData: {
      config: [{
          items: [
            {
              "config": {
                "label": "Field test 1",
                "name": "field1",
                "placeholder": "",
                "validation": "",
                "helper": null,
                "type": "text",
              },
              "label": "Line Input"
            },
            {
              "config": {
                "label": "Field test 2",
                "name": "field2",
                "placeholder": "",
                "validation": "",
                "helper": null,
                "type": "text",
              },
              "label": "Line Input"
            }]
        }],
      data: {},
      page: 0,
      computed: [],
      customCss: `div {background: green;} .form-control {color: gray;}`,
    }
  });

  it('Test custom CSS inclusion', () => {
    // Test if the rendered form contains the custom CSS
    expect(wrapper.html()).toMatch(/<style>.*div{background:green}.*.form-control{color:gray}.*<\/style>/);

  });

  it('Test custom CSS rules are scoped', () => {
    
    // Test if the rendered form contains the custom CSS
    expect(wrapper.html()).toContain('div#renderer-container div{background:green}');
    expect(wrapper.html()).toContain('div#renderer-container .form-control{color:gray}');

  });
});
