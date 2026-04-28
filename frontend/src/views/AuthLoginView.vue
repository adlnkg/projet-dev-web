<script setup>
import Card from "@/components/Card.vue";
import { useMutation } from "@/utils/useData";
import { login } from "@/utils/user";
import { Form } from "@primevue/forms";
import { Button, InputText, Message, Password } from "primevue";
import { useRouter } from "vue-router";

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
      <h1>Connexion</h1>
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
    </Form>
  </Card>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>
