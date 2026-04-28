<script setup>
import { useMutation } from "@/utils/useData";
import { SELECT_GENDER, signin } from "@/utils/user";
import { Form, FormField } from "@primevue/forms";
import { Button, InputText, Message, Password, Select } from "primevue";
import FieldDate from "@/components/FieldDate.vue";
import { useRouter } from "vue-router";
import { DEFAULT_AVATAR } from "@/utils/user";
import { ref } from "vue";
import Card from "@/components/Card.vue";

const router = useRouter();
const { fn: signinFn, loading, error } = useMutation(signin);

const avatar = ref(DEFAULT_AVATAR);
function onAvatarChange(e) {
  const file = e.target.files[0];
  if (file === undefined) return;
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    avatar.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function onSubmit(e) {
  if (e.values.password !== e.values.confirmPassword) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }
  signinFn(e.values).then(() => {
    router.push({ name: "veryfy-otp" });
  });
}
</script>

<template>
  <Card>
    <Form :resolver @submit="onSubmit">
      <Message v-if="error !== null" severity="error" closable>
        {{ error.toString() }}
      </Message>
      <FormField v-slot="field" name="avatar" :initialValue="DEFAULT_AVATAR">
        <label for="avatarUrl">
          <input
            type="file"
            id="avatar"
            accept="image/*"
            v-bind="field.props"
            @change="onAvatarChange"
          />
          <img :src="avatar" alt="Avatar" />
        </label>
      </FormField>
      <div class="group">
        <InputText name="firstName" type="text" placeholder="Prénom" fluid />
        <InputText name="lastName" type="text" placeholder="Nom" fluid />
      </div>
      <InputText name="login" type="text" placeholder="Identifiant" fluid />
      <InputText name="email" type="email" placeholder="Email" fluid />
      <Password name="password" placeholder="Mot de passe" toggleMask fluid />
      <Password
        name="confirmPassword"
        placeholder="Confirmer le mot de passe"
        :feedback="false"
        toggleMask
        fluid
      />
      <Select
        name="sex"
        id="sex"
        :options="SELECT_GENDER"
        optionValue="value"
        optionLabel="label"
      />
      <FieldDate
        name="birthdate"
        id="birthdate"
        :disabled="loading"
        placeholder="Date de naissance"
      />

      <Button type="submit" :disabled="loading">Créer un compte</Button>
    </Form>
  </Card>
</template>

<style>
label[for="avatar"] {
  display: flex;
  justify-content: center;
}
.group {
  display: flex;
  gap: 0.5rem;
}
#avatar + img {
  aspect-ratio: 1;
  border-radius: 50%;
  width: 75% !important;
}
.card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
p-password {
  width: 100%;
}
input[type="file"] {
  display: none;
}
</style>
