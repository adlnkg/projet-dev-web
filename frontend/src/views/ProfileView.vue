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
const { data: pointsHistoryData, loading: loadingHistory } = useData(async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/user/me/points/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Impossible de charger l'historique de points");
  return data.pointsHistory ?? [];
});

const age = computed(() => user === null ? null :
  Math.floor((new Date() - user.value.birthdate) / MILLIS_IN_YEAR
));

const pointsTimeline = computed(() => {
  const sorted = [...(pointsHistoryData.value ?? [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  let cumulative = 0;
  return sorted.map((item) => {
    cumulative += Number(item.amount ?? 0);
    return { date: new Date(item.createdAt), total: cumulative };
  });
});

const chartPoints = computed(() => {
  if (pointsTimeline.value.length === 0) return "";
  const width = 600;
  const height = 220;
  const padding = 24;
  const totals = pointsTimeline.value.map((p) => p.total);
  const min = Math.min(...totals, 0);
  const max = Math.max(...totals, 1);
  const range = max - min || 1;
  return pointsTimeline.value.map((p, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(pointsTimeline.value.length - 1, 1);
    const y = height - padding - (((p.total - min) / range) * (height - padding * 2));
    return `${x},${y}`;
  }).join(" ");
});
</script>

<template>
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

    <section id="points-chart">
      <h2>Historique des points</h2>
      <Skeleton v-if="loadingHistory" width="100%" height="220px" />
      <p v-else-if="pointsTimeline.length === 0">Aucun point enregistré pour le moment.</p>
      <svg v-else viewBox="0 0 600 220" role="img" aria-label="Évolution des points">
        <polyline :points="chartPoints" fill="none" stroke="#1d4ed8" stroke-width="3" />
      </svg>
    </section>
  </Card>
</template>

<style scoped>
:global(body) {
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
}
:global(#content) {
  display: grid;
  place-items: center;
}
:global(.card) {
  max-width: 75%;
  display: flex;
  gap: 1em;
  flex-direction: column;
  align-items: center;
  padding-top: 25vw;
}
#points-chart {
  width: 100%;
}
#points-chart svg {
  width: 100%;
  background: #eff6ff;
  border-radius: 10px;
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
