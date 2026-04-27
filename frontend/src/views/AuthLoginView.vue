<script setup>
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
  <Form :resolver @submit="onSubmit">
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
</template>

<style>
form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;

  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
p-password {
  width: 100%;
}
</style>
