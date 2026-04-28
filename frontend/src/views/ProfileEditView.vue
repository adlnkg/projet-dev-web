<script setup>
import { Button, InputText, Select, Skeleton } from "primevue";
import { Form } from "@primevue/forms";
import FieldDate from "@/components/FieldDate.vue";
import { editUser, getMe, SELECT_GENDER } from "@/utils/user";
import { useData, useMutation } from "@/utils/useData";
import { useRouter } from "vue-router";
import { computed, watch } from "vue";

const router = useRouter();

const { fn: editUserFn, loading: submitLoading, error: submitError } = useMutation(editUser);
const { data: user, loading: initLoading, error: initError } = useData(async () => {
  const user = await getMe();
  user.birthdate = user.birthdate.toLocaleDateString("fr-FR");
  return user;
});

const loading = computed(() => initLoading || submitLoading);
const error = computed(() => initError || submitError);

watch(error, (e) => console.log("Error", e));
watch(loading, (e) => console.log("Loading", e));
watch(user, (e) => console.log("User", e));

async function onSubmit(e) {
  if (e.values.birthdate !== null) {
    e.values.birthdate = new Date(e.values.birthdate);
  }
  const ok = await editUserFn(user.value.id, e.values);
  if (!ok) return;
  router.push({ name: "profile" });
}
</script>

<template>
  <main v-if="error.value !== null">
    Il y a une erreur lors de la récupération des données
  </main>
  <Form v-else v-slot="form" :initialValues="user" :resolver @submit="onSubmit">
    <main>
      <Skeleton v-if="initLoading" width="100%" height="100%" id="avatar" />
      <img v-else :src="user.avatarURL" alt="avatar" id="avatar" />
      <Message v-if="submitError !== null" severity="error" closable>
        {{ submitError.toString() }}
      </Message>
      <div>
        <label for="firstName">Prénom</label>
        <InputText name="firstName" id="firstName" :disabled="initLoading" />

        <label for="lastName">Nom de famille</label>
        <InputText name="lastName" id="lastName" :disabled="initLoading" />

        <label for="login">Identifiant</label>
        <InputText name="login" id="login" :disabled="initLoading" />

        <label for="email">Email</label>
        <InputText name="email" id="email" type="email" :disabled="initLoading" />

        <label for="sex">Genre</label>
        <Select
          name="sex"
          id="sex"
          :options="SELECT_GENDER"
          optionValue="value"
          optionLabel="label"
          :disabled="initLoading"
        />

        <label for="birthdate">
          Né{{ form.gender?.value === "female" ? "e" : "" }} le
        </label>

        <FieldDate name="birthdate" id="birthdate" :disabled="loading.value" />
      </div>

      <Button type="submit" :disabled="loading.value">Enregistrer</Button>
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
