<script setup>
import Card from '@/components/Card.vue';
import { useMutation } from '@/utils/useData';
import { checkOTP } from '@/utils/user';
import { Form } from '@primevue/forms';
import { Button, InputOtp, Message } from 'primevue';
import { watch } from 'vue';
import { useRouter } from 'vue-router';
const { fn: checkOTPFn, loading, error } = useMutation(checkOTP);

watch(error, (e) => {
  console.log(e)
});

const router = useRouter();

async function onSubmit(e) {
  const email = localStorage.getItem("email");
  const ok = await checkOTPFn(email, e.values.otp);
  if (!ok) return;
  router.push({ name: "profile" });
}
</script>

<template>
  <Card floating>
    <Form :resolver @submit="onSubmit">
      <h1>Vérification de votre compte</h1>
      <Message v-if="error !== null" severity="error" closable>
        {{ error.toString() }}
      </Message>
      <Message v-if="error !== null" severity="error" closable>
        {{ error.toString() }}
      </Message>
      <InputOtp name="otp" :length="6" />
      <Button type="submit" :disabled="loading">Se connecter</Button>
    </Form>
  </Card>
</template>

<style>
h1 {
  text-align: center;
}
form {
  display: flex;
  gap: 1em;
  flex-direction: column;
  align-items: center;
}
</style>
