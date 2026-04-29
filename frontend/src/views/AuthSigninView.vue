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
import AvatarChooser from "@/components/AvatarChooser.vue";

const router = useRouter();
const { fn: signinFn, loading, error } = useMutation(signin);

const avatar = ref(DEFAULT_AVATAR);

function onSubmit(e) {
  if (e.values.password !== e.values.confirmPassword) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }
  signinFn(e.values, avatar.value).then(() => {
    router.push({ name: "verify-otp" });
  });
}
</script>

<template>
  <Card floating>
    <Form :resolver @submit="onSubmit">
      <h1>Créer un compte</h1>
      <h2>Créez votre compte pour accéder à votre espace personnel</h2>
      <Message v-if="error !== null" severity="error" closable>
        {{ error.toString() }}
      </Message>
      <AvatarChooser v-model="avatar" />
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
      <p id="already-member">
        Déjà inscrit ? <RouterLink to="/login">Se connecter</RouterLink>
      </p>
    </Form>
  </Card>
</template>

<style>
body {
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
}
.group {
  display: flex;
  gap: 0.5rem;
}
#content {
  display: grid;
  place-items: center;
}
.card {
  max-width: 75%;
  margin-block: 4rem;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
p-password {
  width: 100%;
}
h1 {
  text-align: center;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
h2 {
  text-align: center;
  font-size: 16px;
  color: #6b7280;
  font-weight: normal;
}
#already-member {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}
#already-member a {
  color: #1a5c9e;
  text-decoration: none;
  font-weight: 700;
}
</style>
