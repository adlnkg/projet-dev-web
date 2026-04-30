<script setup>
import { DEFAULT_AVATAR } from '@/utils/user';
import { ref } from 'vue';

const avatar = defineModel()
const props = defineProps({
  defaultAvatar: {
    type: String,
    default: DEFAULT_AVATAR,
  },
})

const avatarUrl = ref(props.defaultAvatar)

function onAvatarChange(e) {
  const file = e.target.files[0];
  if (file === undefined) return;
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
  avatar.value = file
}
</script>

<template>
  <label for="avatarUrl">
    <input
      type="file"
      id="avatar"
      accept="image/*"
      @change="onAvatarChange"
    />
    <img class="avatar-image" :src="avatarUrl" alt="Avatar" />
  </label>
</template>

<style>
label[for="avatar"], label[for="avatarUrl"], label {
  display: flex;
  justify-content: center;
  align-items: center;
}

label > img.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

input[type="file"] {
  /* display: none; */
}

@media (max-width: 768px) {
  label > img.avatar-image {
    width: 90px;
    height: 90px;
  }
}
</style>
