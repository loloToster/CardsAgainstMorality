<script setup lang="ts">
import { reactive } from "vue"
import { useHead } from "@unhead/vue"
import { useRouter } from "vue-router"

import type { ApiCardPack } from "@backend/types"
import api from "@/utils/api"
import { useUserStore } from "@/contexts/user"
import { useNotificationsStore } from "@/contexts/notifications"

import AppLoading from "@/components/AppLoading.vue"
import AppError from "@/components/AppError.vue"
import PackList from "@/components/PackList.vue"
import AppButton from "@/components/AppButton.vue"

useHead({ title: "My Packs" })

const router = useRouter()
const user = useUserStore()
const notifications = useNotificationsStore()

const state = reactive<{
  loading: boolean
  error: boolean
  packs: ApiCardPack[]
}>({
  loading: true,
  error: false,
  packs: []
})

api
  .get(`/api/packs?owner=${user.value?.id}`)
  .then(res => {
    const packs: ApiCardPack[] = res.data.packs
    state.packs = packs
  })
  .catch(err => {
    console.error(err)
    state.error = true
  })
  .finally(() => {
    state.loading = false
  })

async function createPack() {
  try {
    const res = await api.post("/api/pack")
    router.push(`/pack/${res.data.id}`)
  } catch (err) {
    console.error(err)
    notifications.add({
      type: "error",
      text: "Something went wrong while creating a pack"
    })
  }
}
</script>

<template>
  <AppLoading v-if="state.loading">Loading packs</AppLoading>
  <AppError v-else-if="state.error">
    Something went wrong while fetching packs
  </AppError>
  <PackList
    v-else-if="state.packs.length"
    @create="createPack"
    :packs="state.packs"
    editable
  />
  <div v-else class="no-pack">
    <svg viewBox="0 0 24 24">
      <path
        d="M21.47,4.35L20.13,3.79V12.82L22.56,6.96C22.97,5.94 22.5,4.77 21.47,4.35M1.97,8.05L6.93,20C7.24,20.77 7.97,21.24 8.74,21.26C9,21.26 9.27,21.21 9.53,21.1L16.9,18.05C17.65,17.74 18.11,17 18.13,16.26C18.14,16 18.09,15.71 18,15.45L13,3.5C12.71,2.73 11.97,2.26 11.19,2.25C10.93,2.25 10.67,2.31 10.42,2.4L3.06,5.45C2.04,5.87 1.55,7.04 1.97,8.05M18.12,4.25A2,2 0 0,0 16.12,2.25H14.67L18.12,10.59"
      ></path>
    </svg>
    <h1>You do not have any packs</h1>
    <AppButton @click="createPack"> Create a pack </AppButton>
  </div>
</template>

<style scoped lang="scss">
.no-pack {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 20px;
  margin-top: 10vh;

  svg {
    $size: 20vw;
    $max-size: 168px;

    width: $size;
    height: $size;
    max-width: $max-size;
    max-height: $max-size;
    fill: currentColor;
  }

  h1 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: clamp(1.4rem, 7vw, 2.4rem);
  }
}
</style>
