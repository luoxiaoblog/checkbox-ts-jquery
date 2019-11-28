
declare var $: any;

interface ICheckboxGroupOption {
  name?: string;
  value?: string[];
  disabled?: boolean;
  min?: number;
  max?: number;
  checkboxGroup?: ICheckboxOption[];
  changeHandler?: Function;
}


interface ICheckboxOption {
  name?: string;
  label?: string;
  value?: string;
  disabled?: boolean;
  template?: string;
  element?: any;
  checked?: boolean;
}


class Checkbox {
  name: string;
  label: string;
  value: string;
  _disabled: boolean;
  template: string;
  element: any;
  checked: boolean;

  constructor (options: ICheckboxOption) {
    this.name = options.name;
    this.label = options.label;
    this.value = options.value;
    this.disabled = options.disabled;
    this.template = options.template || `
    <label class="lyj-checkbox">
      <span class="lyj-checkbox__input">
        <span class="lyj-checkbox__inner"></span>
        <input type="checkbox" class="lyj-checkbox__original" value="复选框 B">
      </span><span class="lyj-checkbox__label">复选框 B</span>
    </label>
    `;
    this.checked = options.checked;
    this.element = this.createElement()
    this.bindEvent()
  }

  createElement(): any {
    let checkbox = $(this.template)
    if (this.disabled) {
      checkbox.find('.lyj-checkbox__input')
              .addBack()
              .addClass('is-disabled')
    }
    checkbox.find('.lyj-checkbox__original').val(this.value).prop('checked', this.checked)
    checkbox.find('.lyj-checkbox__label').text(this.label)
    return checkbox
  }

  bindEvent() {
    let self = this
    this.element.find('.lyj-checkbox__original').on('change', function () {
      self.checked = $(this).prop('checked') 
      self.element.trigger('lyj-checkbox-change', this)
    })
  }

  refleshCptCheckStatus() {
    if (this.disabled) return;
    this.element.find('.lyj-checkbox__input')
                .addBack()
                .toggleClass('is-checked', this.checked)
  }

  refleshCptDisableStatus() {
    this.element.find('.lyj-checkbox__input')
                .addBack()
                .toggleClass('is-disabled', this.disabled)
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = val;
  }
}


class CheckboxGroup {
  name: string;
  _value: string[];
  _disabled: boolean;
  min: number;
  max: number;
  element: any;
  checkboxGroup: Checkbox[] = [];
  changeHandler: Function;

  constructor (element: any, options: ICheckboxGroupOption) {
    this.name = options.name;
    this.checkboxGroup = options.checkboxGroup.map((checkboxOptions: ICheckboxOption) => {
      checkboxOptions.checked = options.value.indexOf(checkboxOptions.value) != -1
      return new Checkbox(checkboxOptions);
    });
    this.changeHandler = options.changeHandler;
    this.element = this.createElement(element);
    this.disabled = options.disabled;
    this.value = options.value;
    this.min = options.min;
    this.max = options.max;
    this.initEvent() 
  }

  initEvent() {
    this.element.on('lyj-checkbox-change', (event: Event, checkbox: Checkbox) => {
      let value: string[] = []
      this.checkboxGroup.forEach((checkbox: Checkbox) => {
        if (checkbox.checked) {
          value.push(checkbox.value)
        }
      })
      this.value = value;
      this.changeHandler(this.value)
    })
  }

  createElement(element: any): any {
    element.addClass('lyj-checkbox-group').empty()
    this.checkboxGroup.forEach((checkbox: Checkbox) => {
      element.append(checkbox.element);
    })
    return element;
  }

  refleshCptCheckStatus() {
    this.checkboxGroup.forEach((checkbox: Checkbox) => {
      checkbox.checked = this.value.indexOf(checkbox.value) !== -1
      checkbox.refleshCptCheckStatus()
    })
  }

  refleshCptDisableStatus() {
    this.checkboxGroup.forEach((checkbox: Checkbox) => {
      checkbox.disabled = this.disabled
      checkbox.refleshCptDisableStatus()
    })
  }

  get value(): string[] {
    return this._value;
  }

  set value(val: string[]) {
    this._value = val;
    this.refleshCptCheckStatus()
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = val;
    this.refleshCptDisableStatus()
  } 
}

$.fn.extend({
  'lyj_checkboxGroup': function(options: ICheckboxGroupOption) {
    let defaluts: ICheckboxGroupOption = {
      disabled: false,
      min: 0,
      max: options.checkboxGroup.length,
      changeHandler: () => {}
    }
    let implementOptions: ICheckboxGroupOption = $.extend(true, {}, defaluts, options);
    this.each(() => {
        let el = $(this);
        if (el.data('checkboxGroup'))
            el.data('checkboxGroup').remove();
        el.data('checkboxGroup', new CheckboxGroup(el, implementOptions));
    });
    return this;
  }
});
