<script setup>
import Card from "@/components/Card.vue";
import { useData } from "@/utils/useData";
import { getMe } from "@/utils/user";
import { Button, Skeleton } from "primevue";
import { computed } from "vue";
import { RouterLink } from "vue-router";

const MILLIS_IN_YEAR = 31536000000;

const UI_GENDERS = {
  M: "Homme",
  F: "Femme",
  O: "Autre",
};

const { data: user, loading, error } = useData(getMe);
const age = computed(() => user === null ? null :
  Math.floor((new Date() - user.value.birthdate) / MILLIS_IN_YEAR
));
</script>

<template>
  <div class="profile-page">
    <main v-if="error !== null">
      Il y a une erreur lors de la récupération des données
    </main>
    <Card floating v-else>
      <Skeleton v-if="loading" width="100%" height="100%" id="avatar" />
      <img v-else :src="user.avatarUrl" alt="avatar" id="avatar" />

      <Skeleton v-if="loading" width="100%"  height="2em" />
      <h1 v-else>
        {{ user.firstName }} {{ user.lastName }}
        <span>@{{ user.login }}</span>
      </h1>

      <div id="infos">
        <span>Email</span>
        <Skeleton v-if="loading" width="200px" height="1em" />
        <a v-else :href="`mailto:${user.email}`">{{ user.email }}</a>

        <span>Age</span>
        <Skeleton v-if="loading" width="200px" height="1em" />
        <span v-else>{{ age }} an{{ age > 1 ? "s" : "" }}</span>

        <span>Genre</span>
        <Skeleton v-if="loading" width="200px" height="1em" />
        <span v-else>{{ UI_GENDERS[user.sex] ?? "Autre" }}</span>

        <span>Né{{ user?.gender == "male" ? "" : "e" }} le</span>
        <Skeleton v-if="loading" width="200px" height="1em" />
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
    </Card>
  </div>
</template>

<style scoped>
.profile-page {
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
#infos {
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
