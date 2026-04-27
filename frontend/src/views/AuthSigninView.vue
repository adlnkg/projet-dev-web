<script setup>
import { useMutation } from "@/utils/useData";
import { SELECT_GENDER, signin } from "@/utils/user";
import { Form, FormField } from "@primevue/forms";
import { Button, InputText, Message, Password, Select } from "primevue";
import FieldDate from "@/components/FieldDate.vue";
import { useRouter } from "vue-router";
import { DEFAULT_AVATAR } from "@/utils/user";
import { ref } from "vue";

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
  }
  reader.readAsDataURL(file);
}

function onSubmit(e) {
  signinFn(e.values).then(() => {
    router.push({ name: "auth-login" });
  });
}

// return {
//   pseudo: "polnio",
//   email: "paul.lagrange@etu.cyu.fr",
//   firstname: "Paul",
//   lastname: "Lagrange",
//   birthdate: new Date("2005-07-07"),
//   gender: "male",
//   avatar:
//     "https://as2.ftcdn.net/jpg/02/44/42/79/1000_F_244427911_aoHHulebtYy4wLpncBBuWqCTNFKolcCB.jpg",
// };
</script>

<template>
  <Form :resolver @submit="onSubmit">
    <Message v-if="error !== null" severity="error" closable>
      {{ error.toString() }}
    </Message>
    <FormField v-slot="field" name="avatar" :initialValue="DEFAULT_AVATAR">
      <label for="avatar">
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
    <InputText name="pseudo" type="text" placeholder="Identifiant" fluid />
    <InputText name="email" type="email" placeholder="Email" fluid />
    <InputText name="firstname" type="text" placeholder="Prénom" fluid />
    <InputText name="lastname" type="text" placeholder="Nom" fluid />
    <Select
      name="gender"
      id="gender"
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

    <Password name="password" placeholder="Mot de passe" toggleMask fluid />
    <Password
      name="confirmPassword"
      placeholder="Confirmer le mot de passe"
      :feedback="false"
      toggleMask
      fluid
    />
    <Button type="submit" :disabled="loading">Créer un compte</Button>
  </Form>
</template>

<style>
label[for="avatar"] {
  display: flex;
  justify-content: center;
}
#avatar + img {
  aspect-ratio: 1;
  border-radius: 50%;
  width: 75% !important;
}
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
input[type="file"] {
  display: none;
}
</style>
