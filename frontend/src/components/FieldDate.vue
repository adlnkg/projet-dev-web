<script setup>
import { DatePicker } from "primevue";
import { FormField } from "@primevue/forms";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <FormField class="field-date" v-slot="field" :name="props.name" :id="props.id">
    <DatePicker
      :modelValue="field.value"
      @update:modelValue="(v) => (field.value = v)"
      updateModelType="string"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
    />
  </FormField>
</template>

<style>
.field-date {
  display: grid;
}
</style>
