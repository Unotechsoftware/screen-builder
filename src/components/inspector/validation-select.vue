<template>
  <div class="form-group">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <label class="m-0">{{ label }}</label>
      <b-button class="" variant="secondary" size="sm" @click="showAddCard">{{ $t('Add Rule') }}</b-button>
    </div>
    <div v-if="showCard" class="card mb-2">
      <div class="card-body p-2">
        <multiselect
          label="content"
          track-by="value"
          v-model="selectedOption"
          :placeholder="$t('Select...')"
          :show-labels="false"
          :options="options"
          :class="fieldClass"
        >
          <template slot="noResult">{{ $t('No elements found. Consider changing the search query.') }}</template>
          <template slot="noOptions">{{ $t('No Data Available') }}</template>
        </multiselect>
        <div v-if="optionError" class="invalid-feedback d-block">
          <div>{{ optionError }}</div>
        </div>
      </div>
      <div class="card-footer text-right p-2">
        <b-button @click="hideCard" variant="outline-secondary" size="sm" class="mr-2">{{ $t('Cancel') }}</b-button>
        <b-button @click="saveRule" :disabled="disableBtn" variant="secondary" size="sm">{{ $t('Save') }}</b-button>
      </div>
    </div>
    <p v-if="!hasRules && !showCard">{{ $t('No validation rule(s)') }}</p>
    <div v-if="hasRules">
      <div role="tablist">
        <b-card v-for="(rule, index) in rules" class="mb-2" :key="index">
          <div v-if="showDeleteConfirmCard && removeIndex == index" class="card mb-3 bg-danger text-white text-right">
            <div class="card-body p-2">
              {{ confirmMessage }}
            </div>
            <div class="card-footer text-right p-2">
              <button type="button" class="btn btn-sm btn-light mr-2" @click="hideDeleteConfirmCard">
                {{ $t('Cancel') }}
              </button>
              <button type="button" class="btn btn-sm btn-danger" @click="deleteRule(index)">
                {{ $t('Delete') }}
              </button>
            </div>
          </div>
          <b-card-header header-tag="header" class="p-0" role="tab">
            <div class="p-1 d-flex justify-content-between align-items-center">
              {{ rule.content }}
              <div class="actions">
                <b-button variant="link" class="p-0 mr-1 secondary" v-if="rule.configs" v-b-toggle="rule.content"><i class="fas fa-cog fa-fw text-secondary"/></b-button>
                <b-button variant="link" class="p-0" @click="confirmDelete(index)"><i class="fas fa-trash-alt fa-fw text-secondary"/></b-button>
              </div>
            </div>
          </b-card-header>
          <b-collapse :id="rule.content" :accordion="rule.content" :visible="rule.visible" role="tabpanel">
            <b-card-body class="p-2"> 
              <div v-for="config in rule.configs" :key="config.label" class="mb-2">
                <div v-if="config.type === 'FormInput'">
                  <form-input :label="config.label" :name="config.label" v-model="config.value" :validation="config.validation" :helper="config.helper"/>
                </div>
              </div>
              <div><small class="form-text text-muted">{{ rule.helper }}</small></div>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
    </div>
    <small class="form-text text-muted">{{ helper }}</small>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import { FormInput } from '@processmaker/vue-form-elements';

export default {
  props: ['label', 'value', 'helper', 'name'],
  components: {
    Multiselect,
    FormInput,
  },
  data() {
    return {
      rules: [],
      showCard: false,
      showDeleteConfirmCard: false,
      selectedOption: '',
      confirmMessage: '',
      removeIndex: null,
      optionError: '',
      disableBtn: false,
      options: [
        {
          value: 'accepted',
          content: this.$t('Accepted'),
          helper: this.$t('The field under validation must be yes, on, 1 or true.'),
        },
        {
          value: 'alpha',
          content: this.$t('Alpha'),
          helper: this.$t('The field under validation must be entirely alphabetic characters.'),
        },
        {
          value: 'alpha_num',
          content: this.$t('Alpha-Numeric'),
          helper: this.$t('The field under validation must be entirely alpha-numeric characters.'),
        },
        {
          value: '',
          field: 'between:',
          content: this.$t('Between Min & Max'),
          helper: this.$t('The field under validation must have a size between the given min and max.'),
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Min'), helper: '', validation:'required|integer' },
            { type: 'FormInput', label: this.$t('Max'), helper: '', validation:'required|integer' },
          ],
        },
        {
          value: 'email',
          content: this.$t('Email'),
          helper: this.$t('The field under validation must be formatted as an e-mail address.'),
        },
        {
          value: '',
          field: 'in:',
          content: this.$t('In'),
          helper: this.$t('The field under validation must be included in the given list of values. The field can be an array or string.'),
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Values'), helper: '', validation:'required' },
          ],
        },
        {
          value: '',
          field: 'max:',
          content: this.$t('Max Length'),
          helper: '',
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Max Input'), helper: this.$t('Validate that an attribute is no greater than a given length.'), validation:'required|integer' },
          ],
        },
        {
          value: '',
          field: 'min:',
          content: this.$t('Min Length'),
          helper: '',
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Min Input'), helper: this.$t('Validate that an attribute is at least a given length.'), validation:'required|integer' },
          ],
        },
        {
          value: '',
          field: 'not_in:',
          content: this.$t('Not In'),
          helper: this.$t('The field under validation must not be included in the given list of values.'),
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Values'), helper: '', validation:'required' },
          ],
        },
        {
          value: 'required',
          content: this.$t('Required'),
          helper: this.$t('Checks if the length of the String representation of the value is >'),
        },
        {
          value: '',
          field: 'required_if:',
          content: this.$t('Required If'),
          helper: this.$t('The field under validation must be present and not empty if the Variable Name field is equal to any value.'),
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Variable Name'), helper: '', validation:'required' },
            { type: 'FormInput', label: this.$t('Variable Value'), helper: '', validation:'required' },
          ],
        },
        {
          value: '',
          field: 'required_unless:',
          content: this.$t('Required Unless'),
          helper: this.$t('The field under validation must be present and not empty unless the Variable Name field is equal to any value.'),
          visible: true,
          configs: [
            { type: 'FormInput', label: this.$t('Variable Name'), helper: '', validation:'required' },
            { type: 'FormInput', label: this.$t('Variable Value'), helper: '', validation:'required' },
          ],
        },
        {
          value: '',
          field: 'same:',
          content: this.$t('Same'),
          helper: this.$t('The given field must match the field under validation.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Variable Name'), helper: '', validation: 'required'},
          ],
        },
        {
          value: 'url',
          content: 'URL',
          helper: this.$t('Validate that an attribute has a valid URL format.'),
        },
        {
          value: 'date',
          content: 'Date',
          helper: this.$t('The field under validation must be a valid date format which is acceptable by Javascript\'s Date object.'),
        },
        {
          value: '',
          field: 'after:',
          content: this.$t('After Date'),
          helper: this.$t('The field under validation must be after the given date.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Date'), helper: '', validation: 'required'},
          ],
        },
        {
          value: '',
          field: 'after_or_equal:',
          content: this.$t('After or Equal to Date'),
          helper: this.$t('The field unter validation must be after or equal to the given field.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Date'), helper: '', validation: 'required'},
          ],
        },
        {
          value: '',
          field: 'before:',
          content: this.$t('Before Date'),
          helper: this.$t('The field unter validation must be before the given date.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Date'), helper: '', validation: 'required'},
          ],
        },
        {
          value: '',
          field: 'before_or_equal:',
          content: this.$t('Before or Equal to Date'),
          helper: this.$t('The field unter validation must be before or equal to the given field.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Date'), helper: '', validation: 'required'},
          ],
        },
        {
          value: '',
          field: 'regex:',
          content: this.$t('Regex'),
          helper: this.$t('The field under validation must match the given regular expression.'),
          visible: true,
          configs: [
            {type: 'FormInput', label: this.$t('Regex Pattern'), helper: '', validation: 'required'},
          ],
        },
      ],
    };
  },
  computed: {
    fieldClass() {
      return this.optionError ? 'is-invalid' : '';
    },
    hasRules() {
      if (this.rules && this.rules.length) {
        return true;
      }
      
      return false;
    }
  },
  watch: {
    rules: {
      deep: true,
      handler(rules) {
        if (typeof rules === 'string' || rules === undefined) {
          this.rules = [];
        }
        if (this.rules) {
          this.setRuleConfigs();
        }
        this.$emit('input', rules);
      },
    },
    value() {
      this.rules = this.value;
    },
    selectedOption: {
      deep: true,
      handler(value) {
        if (this.rules && this.rules.find(item => { return item.content === value.content; })) {
          this.optionError = this.$t('This field already exists');
          this.disableBtn = true;
        } else {
          this.disableBtn = false;
          this.optionError = '';
        }
      },
    },
  },
  methods: {
    showAddCard() {
      this.showCard = true;
      if (this.selectedOption == '') {
        this.disableBtn = true;
      }
    },
    hideCard() {
      this.showCard = false;
      this.selectedOption = '';
      this.optionError = '';
    },
    saveRule() {
      const option = _.cloneDeep(this.selectedOption);
      this.rules.push(option);
      this.hideCard();
      this.selectedOption = '';
    },
    confirmDelete(index) {
      this.removeIndex = index;
      this.showDeleteConfirmCard = true;
      this.confirmMessage = this.$t('Are you sure you want to delete the "{{item}}" rule?', {item: this.rules[index].content});
    },
    hideDeleteConfirmCard() {
      this.removeIndex = null;
      this.showConfirmationCard = false;
    },
    deleteRule(index) {
      this.rules.splice(index, 1);
      this.hideDeleteConfirmCard();
    },
    setRuleConfigs() {
      this.rules.forEach(rule => {
        if (rule.configs) {
          let ruleConfigs = [];
          rule.configs.forEach(config => {
            if (config.value) {
              ruleConfigs.push(config.value);
            }
          });

          if (ruleConfigs.length > 1) {  
            ruleConfigs = ruleConfigs.join(',');
          }
          if (ruleConfigs.length) {
            rule.value = rule.field + ruleConfigs;
          }
          
        }
      });
    }, 
  },
  mounted() {
    this.rules = this.value;
  },
};
</script>

<style lang="scss" scoped>
.card-body {
  padding: 0;
}
</style>
