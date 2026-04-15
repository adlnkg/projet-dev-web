<script setup>
import { useData } from "@/utils/useData";
import { fetchUser } from "@/utils/user";
import { Button, Skeleton } from "primevue";
import { computed } from "vue";
import { RouterLink } from "vue-router";

const MILLIS_IN_YEAR = 31536000000;

const UI_GENDERS = {
  male: "Homme",
  female: "Femme",
};

const { data: user, loading, error } = useData(fetchUser);
const age = computed(() => user === null ? null :
  Math.floor((new Date() - user.value.birthdate) / MILLIS_IN_YEAR
));
</script>

<template>
  <main v-if="error !== null">
    Il y a une erreur lors de la récupération des données
  </main>
  <main v-else>
    <Skeleton v-if="loading" width="100%" height="100%" id="avatar" />
    <img v-else :src="user.avatar" alt="avatar" id="avatar" />

    <Skeleton v-if="loading" width="50%" height="2em" />
    <h1 v-else>
      {{ user.firstname }} {{ user.lastname }}
      <span>@{{ user.pseudo }}</span>
    </h1>

    <div>
      <span>Email</span>
      <Skeleton v-if="loading" width="30vw" height="1em" />
      <a v-else :href="`mailto:${user.email}`">{{ user.email }}</a>

      <span>Age</span>
      <Skeleton v-if="loading" width="30vw" height="1em" />
      <span v-else>{{ age }} an{{ age > 1 ? "s" : "" }}</span>

      <span>Genre</span>
      <Skeleton v-if="loading" width="30vw" height="1em" />
      <span v-else>{{ UI_GENDERS[user.gender] ?? "Autre" }}</span>

      <span>Né{{ user?.gender == "male" ? "" : "e" }} le</span>
      <Skeleton v-if="loading" width="30vw" height="1em" />
      <span v-else>
        {{
          user.birthdate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }}
      </span>
    </div>
    <Button asChild v-slot="slotProps">
      <RouterLink :to="{ name: 'edit-profile' }" :class="slotProps.class">
        Modifier le profil
      </RouterLink>
    </Button>
  </main>
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
</style v-else>
