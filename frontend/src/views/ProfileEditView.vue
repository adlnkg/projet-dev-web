<script setup>
import { Button, DatePicker, InputText, Select, Skeleton } from "primevue";
import { Form, FormField } from "@primevue/forms";
import { fetchUser } from "@/utils/user";
import { useData } from "@/utils/useData";
import { useRouter } from "vue-router";

const SELECT_GENDER = [
  { label: "Homme", value: "male" },
  { label: "Femme", value: "female" },
  { label: "Autre", value: "other" },
];

const router = useRouter();
const { data: user, loading, error } = useData(async () => {
  const user = await fetchUser();
  user.birthdate = user.birthdate.toLocaleDateString("fr-FR");
  return user;
});

function onSubmit(e) {
  if (e.values.birthdate !== null) {
    e.values.birthdate = new Date(e.values.birthdate);
  }
  console.log(e.values);
  router.push({ name: "profile" });
}
</script>

<template>
  <main v-if="error !== null">
    Il y a une erreur lors de la récupération des données
  </main>
  <Form v-else v-slot="form" :initialValues="user" :resolver @submit="onSubmit">
    <main>
      <Skeleton v-if="loading" width="100%" height="100%" id="avatar" />
      <img v-else :src="user.avatar" alt="avatar" id="avatar" />
      <div>
        <label for="firstname">Prénom</label>
        <InputText name="firstname" id="firstname" :disabled="loading" />

        <label for="lastname">Nom de famille</label>
        <InputText name="lastname" id="lastname" :disabled="loading" />

        <label for="pseudo">Identifiant</label>
        <InputText name="pseudo" id="pseudo" :disabled="loading" />

        <label for="email">Email</label>
        <InputText name="email" id="email" type="email" :disabled="loading" />

        <label for="gender">Genre</label>
        <Select
          name="gender"
          id="gender"
          :options="SELECT_GENDER"
          optionValue="value"
          optionLabel="label"
          :disabled="loading"
        />

        <label for="birthdate">
          Né{{ form.gender?.value === "female" ? "e" : "" }} le
        </label>

        <FormField v-slot="field" name="birthdate" id="birthdate">
          <DatePicker
            :modelValue="field.value"
            @update:modelValue="(v) => (field.value = v)"
            updateModelType="string"
            :disabled="loading"
          />
        </FormField>
      </div>

      <Button type="submit" :disabled="loading">Enregistrer</Button>
    </main>
  </Form>
</template>

<style scoped>
main {
  display: flex;
  gap: 1em;
  flex-direction: column;
  align-items: center;
  padding-top: 25vw;
}
main > div {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
#avatar {
  aspect-ratio: 1;
  border-radius: 50%;
  width: 25% !important;
}
h1 {
  margin-block: 0;
}
h1 span {
  font-size: 0.5em;
}
:global(a.p-button) {
  text-decoration: none;
}
</style>
