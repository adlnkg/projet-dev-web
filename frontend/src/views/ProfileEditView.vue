<script setup>
import { Button, InputText, Message, Select, Skeleton } from "primevue";
import { Form } from "@primevue/forms";
import FieldDate from "@/components/FieldDate.vue";
import { editUser, getMe, SELECT_GENDER, DEFAULT_AVATAR } from "@/utils/user";
import { useData, useMutation } from "@/utils/useData";
import { useRouter } from "vue-router";
import { computed, ref, watch } from "vue";
import Card from "@/components/Card.vue";
import AvatarChooser from "@/components/AvatarChooser.vue";

const router = useRouter();

const {
  fn: editUserFn,
  loading: submitLoading,
  error: submitError,
} = useMutation(editUser);
const {
  data: user,
  loading: initLoading,
  error: initError,
} = useData(async () => {
  const user = await getMe();
  user.birthdate = user.birthdate.toLocaleDateString("fr-FR");
  return user;
});

const loading = computed(() => initLoading || submitLoading);
const error = computed(() => initError || submitError);

watch(error, (e) => console.log("Error", e));
watch(loading, (e) => console.log("Loading", e));
watch(user, (e) => console.log("User", e));

const avatar = ref(null);

async function onSubmit(e) {
  if (e.values.birthdate !== null) {
    e.values.birthdate = new Date(e.values.birthdate);
  }
  const ok = await editUserFn(user.value.id, e.values, avatar.value);
  if (!ok) return;
  router.push({ name: "profile" });
}
</script>

<template>
  <div class="profile-edit-page">
    <main v-if="error.value !== null">
      Il y a une erreur lors de la récupération des données
    </main>
    <Card v-else>
      <Form v-slot="form" :initialValues="user" :resolver @submit="onSubmit">
        <main>
          <div class="avatar-container">
            <Skeleton v-if="initLoading" width="120" height="120" />
            <AvatarChooser v-else v-model="avatar" :defaultAvatar="user.avatarUrl" />
          </div>

          <Message v-if="submitError !== null" severity="error" closable>
            {{ submitError.toString() }}
          </Message>

          <div class="form-grid">
            <div class="form-field">
              <label for="firstName">Prénom</label>
              <InputText name="firstName" id="firstName" :disabled="initLoading" />
            </div>

            <div class="form-field">
              <label for="lastName">Nom de famille</label>
              <InputText name="lastName" id="lastName" :disabled="initLoading" />
            </div>

            <div class="form-field">
              <label for="login">Identifiant</label>
              <InputText name="login" id="login" :disabled="initLoading" />
            </div>

            <div class="form-field">
              <label for="email">Email</label>
              <InputText
                name="email"
                id="email"
                type="email"
                :disabled="initLoading"
              />
            </div>

            <div class="form-field">
              <label for="sex">Genre</label>
              <Select
                name="sex"
                id="sex"
                :options="SELECT_GENDER"
                optionValue="value"
                optionLabel="label"
                :disabled="initLoading"
              />
            </div>

            <div class="form-field">
              <label for="birthdate">
                Né{{ form.gender?.value === "female" ? "e" : "" }} le
              </label>

              <FieldDate
                name="birthdate"
                id="birthdate"
                :disabled="loading.value"
              />
            </div>
          </div>

          <Button type="submit" :disabled="loading.value">Enregistrer</Button>
        </main>
      </Form>
    </Card>
  </div>
</template>

<style scoped>
.profile-edit-page {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
}
.card {
  width: min(100%, 960px);
  display: flex;
  gap: 1em;
  flex-direction: column;
  align-items: center;
}
main {
  display: flex;
  gap: 1em;
  flex-direction: column;
  align-items: center;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0 0 0;
}

.avatar-container img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .avatar-container img {
    width: 90px;
    height: 90px;
  }
}
</style>
