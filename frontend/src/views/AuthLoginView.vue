<script setup>
import Card from "@/components/Card.vue";
import { useMutation } from "@/utils/useData";
import { login } from "@/utils/user";
import { Form } from "@primevue/forms";
import { Button, InputText, Message, Password } from "primevue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const { fn: loginFn, loading, error } = useMutation(login);

function onSubmit(e) {
  loginFn(e.values.pseudo, e.values.password).then((user) => {
    if (user === undefined) return;
    router.push({ name: "profile" });
  });
}
</script>

<template>
  <Card floating>
    <Form :resolver @submit="onSubmit">
      <h1>Se connecter</h1>
      <h2>Accédez à votre espace personnel</h2>
      <Message v-if="error !== null" severity="error" closable>
        {{ error.toString() }}
      </Message>
      <InputText name="pseudo" type="text" placeholder="Identifiant" fluid />
      <Password
        name="password"
        placeholder="Mot de passe"
        :feedback="false"
        toggleMask
        fluid
      />
      <Button type="submit" :disabled="loading">Se connecter</Button>
      <p id="not-member">Pas encore inscrit ? <RouterLink to="/register">Créer un compte</RouterLink></p>
    </Form>
  </Card>
</template>

<style scoped>
:global(body) {
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
}
form {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
:global(#content) {
  display: grid;
  place-items: center;
}
.card {
  max-width: 50%;
  margin-block: 4rem;
}
#not-member {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}
:global(#not-member a) {
  color: #1a5c9e;
  text-decoration: none;
  font-weight: 700;
}
</style>
