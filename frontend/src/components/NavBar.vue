<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMe, DEFAULT_AVATAR } from '../utils/user'

const router = useRouter()
const recherche = ref('')
const langue = ref('FR')
const menuLangueVisible = ref(false)
const menuMobileVisible = ref(false)

const currentUser = ref(null)
const showAdmin = computed(() => currentUser.value && (currentUser.value.role === 'ADMIN' || currentUser.value.role === 'SUPER_USER'))

onMounted(async () => {
  try {
    currentUser.value = await getMe()
  } catch (e) {
    // silent
  }
})

function goToProfile() {
  router.push('/profile')
}

function logOut() {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  currentUser.value = null
  router.push('/')
}

const avatarUrl = computed(() => {
  if (!currentUser.value) return DEFAULT_AVATAR
  return currentUser.value.avatarUrl || currentUser.value.avatar || DEFAULT_AVATAR
})

function scrollVers(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    menuMobileVisible.value = false
  }

}

function allerSection(id) {
  if (router.currentRoute.value.path === '/') {
    scrollVers(id)
    return
  }
  router.push('/').then(() => {
    setTimeout(() => scrollVers(id), 320)
  })
}

function changerLangue(l) {
  langue.value = l
  menuLangueVisible.value = false
}

function lancerRecherche() {
  const kw = recherche.value.trim()
  if (!kw) return
  router.push({ path: '/recherche', query: { keywords: kw } })
  menuMobileVisible.value = false
}

function effacerRecherche() {
  recherche.value = ''
}
</script>

<template>
  <div>
    <!-- BARRE SUPÉRIEURE -->
    <div class="topbar">
      <div class="topbar-links">
        <span @click="allerSection('actualites')">ACTUALITÉS</span>
        <span class="sep">|</span>
        <span @click="allerSection('evenements')">ÉVÉNEMENTS</span>
        <span class="sep">|</span>
        <span @click="router.push('/users')">UTILISATEURS</span>
        <span class="sep">|</span>
        <span @click="allerSection('contact')">CONTACT</span>
      </div>
      <!-- <div class="topbar-right"> -->
        <!-- <div class="langue-menu"> -->
          <!-- <span class="langue-btn" @click="menuLangueVisible = !menuLangueVisible"> -->
            <!-- {{ langue }} ▾ -->
          <!-- </span> -->
          <!-- <div class="langue-dropdown" v-if="menuLangueVisible"> -->
            <!-- <span v-if="langue === 'FR'" @click="changerLangue('EN')">🇬🇧 EN</span> -->
            <!-- <span v-if="langue === 'EN'" @click="changerLangue('FR')">🇫🇷 FR</span> -->
          <!-- </div> -->
        <!-- </div> -->
      <!-- </div> -->
    </div>

    <!-- NAVBAR PRINCIPALE -->
    <nav class="navbar">
      <div class="navbar-brand" @click="router.push('/')" title="Accueil">
        <img src="/cytech-logo.png" alt="CYTech" class="navbar-logo" />
        <div>
          <div class="navbar-name">CYTech</div>
          <div class="navbar-sub">École d'Ingénieurs</div>
        </div>
      </div>

      <!-- LIENS DESKTOP -->
      <div class="navbar-links desktop-only">
        <span class="nav-link" @click="allerSection('quisommesnous')">QUI SOMMES NOUS</span>
        <span class="nav-link" @click="allerSection('formations')">NOS FORMATIONS</span>
        <span class="nav-link" @click="allerSection('objets')">OBJETS CONNECTÉS</span>
        <span v-if="showAdmin" class="nav-link" @click="router.push('/admin')">ADMIN</span>
        <template v-if="!currentUser">
          <button class="nav-cta" @click="router.push('/login')">S'INSCRIRE / SE CONNECTER</button>
        </template>
        <template v-else>
          <button class="avatar-btn" @click="goToProfile" :title="currentUser.firstName || currentUser.login">
            <img :src="avatarUrl" alt="avatar" class="avatar-img" />
          </button>
          <button class="nav-cta" @click="logOut">SE DÉCONNECTER</button>
        </template>
      </div>

      <!-- RECHERCHE DESKTOP -->
      <div class="navbar-search desktop-only">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            v-model="recherche"
            type="text"
            placeholder="Rechercher..."
            class="search-input"
            @keyup.enter="lancerRecherche"
          />
          <button class="search-launch" @click="lancerRecherche">Rechercher</button>
        </div>
      </div>

      <!-- BOUTON MENU MOBILE -->
      <button class="menu-mobile-btn mobile-only" @click="menuMobileVisible = !menuMobileVisible">
        {{ menuMobileVisible ? '✕' : '☰' }}
      </button>
    </nav>

    <!-- MENU MOBILE -->
    <div class="menu-mobile" v-if="menuMobileVisible">
      <div class="mobile-search">
        <input
          v-model="recherche"
          type="text"
          placeholder="Rechercher..."
          class="mobile-search-input"
          @keyup.enter="lancerRecherche"
        />
        <button @click="lancerRecherche" class="mobile-search-btn">🔍</button>
      </div>
      <div class="mobile-links">
        <span @click="allerSection('quisommesnous')">QUI SOMMES NOUS</span>
        <span @click="allerSection('formations')">NOS FORMATIONS</span>
        <span @click="allerSection('objets')">OBJETS CONNECTÉS</span>
        <span @click="allerSection('actualites')">ACTUALITÉS</span>
        <span @click="allerSection('evenements')">ÉVÉNEMENTS</span>
        <span @click="router.push('/users')">UTILISATEURS</span>
        <span @click="allerSection('contact')">CONTACT</span>
        <span v-if="showAdmin" @click="router.push('/admin')">ADMIN</span>
        <template v-if="!currentUser">
          <button class="mobile-inscrire" @click="router.push('/login')">S'INSCRIRE / SE CONNECTER</button>
        </template>
        <template v-else>
          <div class="mobile-avatar-row" @click="goToProfile" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <img :src="avatarUrl" alt="avatar" class="avatar-img mobile-avatar" />
            <span style="font-weight:700;color:#0d2d5e">{{ currentUser.firstName || currentUser.login }}</span>
          </div>
          <button class="mobile-inscrire" @click="logOut">SE DÉCONNECTER</button>
        </template>
      </div>
    </div>

    <!-- BACKDROP pour fermer le panneau -->
    <div class="search-backdrop" v-if="menuMobileVisible" @click="menuMobileVisible = false"></div>
  </div>
</template>

<style scoped>
.topbar {
  background: linear-gradient(90deg, #0d2d5e 0%, #1a5c9e 70%, #2563eb 100%);
  color: white;
  padding: 9px 1.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  letter-spacing: 1px;
  position: sticky;
  top: 0;
  z-index: 230;
}

.topbar-links {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dbeafe;
}

.topbar-links span:not(.sep) {
  cursor: pointer;
  font-weight: 700;
  transition: color 0.15s, transform 0.15s;
}

.topbar-links span:not(.sep):hover {
  color: white;
  transform: translateY(-1px);
}

.topbar-right {
  display: flex;
  align-items: center;
}

.sep {
  color: rgba(255, 255, 255, 0.45);
}

.langue-menu {
  position: relative;
}

.langue-btn {
  cursor: pointer;
  color: #e2ecff;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.langue-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.langue-dropdown {
  position: absolute;
  top: 34px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  min-width: 110px;
  z-index: 300;
}

.langue-dropdown span {
  display: block;
  padding: 10px 14px;
  font-size: 13px;
  color: #1f2937;
  cursor: pointer;
}

.langue-dropdown span:hover {
  background: #eff6ff;
  color: #1a5c9e;
}

.navbar {
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  position: sticky;
  top: 38px;
  z-index: 220;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 200px;
}

.navbar-logo {
  height: 58px;
  width: auto;
}

.navbar-name {
  font-weight: 900;
  font-size: 21px;
  color: #0d2d5e;
  letter-spacing: 1.4px;
}

.navbar-sub {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.nav-link {
  font-size: 11px;
  font-weight: 800;
  color: #0f315f;
  letter-spacing: 0.7px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}

.nav-link:hover {
  background: #eff6ff;
  color: #1a5c9e;
  transform: translateY(-1px);
}

.nav-cta {
  background: linear-gradient(135deg, #1a5c9e 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  box-shadow: 0 8px 16px rgba(26, 92, 158, 0.28);
  transition: transform 0.15s, box-shadow 0.15s;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(26, 92, 158, 0.34);
}

.avatar-btn {
  background: white;
  border: 2px solid #dbeafe;
  padding: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.avatar-btn:hover {
  border-color: #1a5c9e;
  transform: translateY(-1px);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.navbar-search {
  position: relative;
  margin-left: 0.8rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #dbe3ef;
  border-radius: 999px;
  padding: 8px 12px;
  min-width: 290px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}


.search-icon {
  font-size: 13px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #1f2937;
  background: transparent;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
}

.search-clear:hover {
  color: #0f172a;
}


.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 190;
  background: transparent;
}

.menu-mobile-btn {
  width: 42px;
  height: 42px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  color: #0d2d5e;
  font-size: 20px;
  font-weight: 700;
}

.menu-mobile {
  background: white;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: sticky;
  top: 122px;
  z-index: 200;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.06);
}

.mobile-search {
  display: flex;
  gap: 8px;
}

.mobile-search-input {
  border: 1.5px solid #dbe3ef;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  outline: none;
}

.mobile-search-input {
  flex: 1;
}

.mobile-search-input:focus {
  border-color: #1a5c9e;
}

.mobile-search-btn {
  border: none;
  border-radius: 10px;
  background: #1a5c9e;
  color: white;
  width: 42px;
  cursor: pointer;
}


.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mobile-links span {
  padding: 10px 2px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  color: #0d2d5e;
  font-size: 14px;
  font-weight: 700;
}

.mobile-links span:hover {
  color: #1a5c9e;
}

.mobile-inscrire {
  border: none;
  border-radius: 10px;
  background: #1a5c9e;
  color: white;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.mobile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

.search-launch {
  border: none;
  border-radius: 999px;
  background: #1a5c9e;
  color: white;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.search-launch:hover {
  background: #0d2d5e;
}

@media (max-width: 1100px) {
  .navbar-search .search-bar {
    min-width: 240px;
  }

  .nav-link {
    padding: 8px 7px;
    font-size: 10.5px;
  }
}

@media (max-width: 900px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .topbar {
    padding: 8px 1rem;
  }

  .topbar-links {
    display: none;
  }

  .navbar {
    top: 34px;
    height: 76px;
    padding: 0 1rem;
  }

  .navbar-logo {
    height: 48px;
  }

  .navbar-name {
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .navbar-brand {
    min-width: unset;
  }

  .navbar-sub {
    display: none;
  }
}
</style>
