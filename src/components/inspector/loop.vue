<template>
  <div>
    <div class="form-group border-bottom pb-3">
      <label for="type">{{ $t('Data Source') }}</label>
      <b-form-select id="type" v-model="settings.type" :options="options"/>
    </div>
    
    <div class="form-group border-bottom">
      <FormInput
        v-model="settings.varname"
        :label="$t('Variable Name')"
        :name="$t('Variable Name')"
        :helper="$t('This variable will contain an array of objects')"
        validation="regex:/^(?:[A-Z_.a-z])(?:[0-9A-Z_.a-z])*$/|required"
        >
      </FormInput>
    </div>


    <div v-if="settings.type === 'new'" class="form-group border-bottom">
      <FormInput
        v-model="settings.times"
        :label="$t('Default Loop Count')"
        :name="$t('Default Loop Count')"
        :helper="$t('Number of times to show the loop. Value must be greater than zero.')"
        validation="required|integer|min:1|max:100"
        >
      </FormInput>
    </div>

    <form-checkbox name="add"
      :label="$t('Allow additional loops')"
      v-model="settings.add"
      :helper="$t('Check this box to allow task assignee to add additional loops')">
    </form-checkbox>
  </div>
</template>

<script>
import { FormInput, FormCheckbox } from '@processmaker/vue-form-elements';

export default {
  components: { },
  props: ['value'],
  inheritAttrs: false,
  components: { FormInput, FormCheckbox },
  data() {
    return {
      options: [
        { value: 'new', text: this.$t('New Array of Objects')},
        { value: 'existing', text: this.$t('Existing Array')},
      ],
      settings: {
        type: 'new',
        varname: '',
        times: '3',
        add: false,
      }
    }
  },
  watch: {
    settings: {
      handler() {
        this.$emit('input', this.settings);
        this.$emit('setName', this.settings.varname);
      },
      deep: true,
    },
    value: {
      handler() {
        this.settings = this.value;
      },
      immediate: true,
    },
  },
  computed: {
  },
};
</script>

<style lang="scss">
</style>
