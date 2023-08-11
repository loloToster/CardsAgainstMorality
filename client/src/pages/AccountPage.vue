<script setup lang="ts">
import { reactive, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRouter, RouterLink } from "vue-router"
import { AxiosError } from "axios"

import api from "@/utils/api"
import { TITLE } from "@/consts"
import { MIN_USERNAME_LEN, MAX_USERNAME_LEN } from "@backend/consts"
import { useUserStore } from "@/contexts/user"
import { useNotificationsStore } from "@/contexts/notifications"

import AppModal from "@/components/AppModal.vue"
import UserAvatar from "@/components/UserAvatar.vue"
import AppButton from "@/components/AppButton.vue"
import AppLoading from "@/components/AppLoading.vue"

const DELETE_VERIFICATION = "delete my account"

useHead({ title: "My Account" })

const router = useRouter()
const user = useUserStore()
const notifications = useNotificationsStore()

const state = reactive({
  deletingPicture: false,
  username: user.value?.username || "",
  usernameError: "",
  displayName: user.value?.displayName || "",
  saveSettingsEnabled: false,
  savingSettings: false,
  deleteAccountModalActive: false,
  deleteVerificationInp: "",
  deletingAccount: false
})

function handleDeleteModalClose() {
  if (state.deletingAccount) return

  state.deleteAccountModalActive = false
  state.deleteVerificationInp = ""
}

async function handleAccountDelete() {
  state.deletingAccount = true

  try {
    await api.delete("/api/user")
    user.value = null
    router.push("/")
    notifications.add({
      type: "success",
      text: "Successfully deleted your account"
    })
  } catch (err) {
    console.error(err)

    notifications.add({
      type: "error",
      text: "Something went wrong while deleteing your account"
    })
  } finally {
    state.deletingAccount = false
  }
}

async function handlePictureDelete() {
  if (!user.value) return

  state.deletingPicture = true

  try {
    await api.delete("/api/user/picture")
    user.value.picture = null
    notifications.add({
      type: "success",
      text: "Successfully removed profile picture"
    })
  } catch (err) {
    console.error(err)

    notifications.add({
      type: "error",
      text: "Something went wrong while removing profile picture"
    })
  } finally {
    state.deletingPicture = false
  }
}

const usernameInp = ref<HTMLInputElement>()

function handleUsernameInpChange() {
  state.usernameError = ""
  state.saveSettingsEnabled = true
}

async function handleSettingsSave() {
  if (!user.value) return

  if (state.username.length < MIN_USERNAME_LEN) {
    state.usernameError = `Must be between ${MIN_USERNAME_LEN} and ${MAX_USERNAME_LEN} in length.`
    usernameInp.value?.focus()
    return
  }

  state.savingSettings = true

  try {
    const res = await api.patch("/api/user", {
      username: state.username,
      displayName: state.displayName
    })

    state.saveSettingsEnabled = false

    state.username = res.data.username
    state.displayName = res.data.displayName
    user.value.username = res.data.username
    user.value.displayName = res.data.displayName

    notifications.add({ type: "success", text: "Successfully updated profile" })
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 409) {
      state.usernameError = "This username is already taken."
    } else {
      notifications.add({
        type: "error",
        text: "Something went wrong while updating profile"
      })
    }
  } finally {
    state.savingSettings = false
  }
}
</script>

<template>
  <AppModal
    v-if="state.deleteAccountModalActive"
    @close="handleDeleteModalClose"
    title="Delete your account"
    class="delete-modal"
  >
    <p>
      This action will immediately delete your account, along
      <br />
      with <b>all your card packs and likes</b>.
    </p>
    <p>
      Your username will be available to anyone with <br />an account on
      {{ TITLE }}.
    </p>
    <div>
      <div>
        To verify, type <i>{{ DELETE_VERIFICATION }}</i> below:
      </div>
      <input v-model="state.deleteVerificationInp" type="text" />
      <AppButton
        @click="handleAccountDelete"
        :disabled="
          state.deleteVerificationInp !== DELETE_VERIFICATION ||
          state.deletingAccount
        "
        class="delete-modal__btn"
      >
        Delete this account
      </AppButton>
    </div>
  </AppModal>
  <div v-if="user.value" class="account">
    <h1>My account</h1>
    <section>
      <h2>Profile Picture</h2>
      <div class="account__avatar">
        <UserAvatar :user="user.value" class="account__avatar__img" />
        <div>
          <div>To update your profile picture you have to log in again</div>
          <div class="account__avatar__btns">
            <RouterLink to="/login?returnTo=/account">
              <AppButton class="account__btn"> Re-Login </AppButton>
            </RouterLink>
            <AppButton
              v-if="user.value?.picture"
              @click="handlePictureDelete"
              :disabled="state.deletingPicture"
              class="account__btn"
            >
              Remove profile picture
            </AppButton>
          </div>
        </div>
      </div>
    </section>
    <section>
      <h2>Profile Settings</h2>
      <div class="account__settings">
        <div class="account__settings__row">
          <div class="account__settings__row__name">Username</div>
          <div class="account__settings__row__content">
            <input
              v-model="state.username"
              ref="usernameInp"
              @input="handleUsernameInpChange"
              :class="{ error: state.usernameError }"
              :disabled="state.savingSettings"
              :minlength="MIN_USERNAME_LEN"
              :maxlength="MAX_USERNAME_LEN"
              type="text"
            />
            <div :class="{ error: state.usernameError }">
              {{ state.usernameError || "You may update your username" }}
            </div>
          </div>
        </div>
        <div class="account__settings__row">
          <div class="account__settings__row__name">Display Name</div>
          <div class="account__settings__row__content">
            <input
              v-model="state.displayName"
              @input="state.saveSettingsEnabled = true"
              :disabled="state.savingSettings"
              :placeholder="state.username"
              :maxlength="MAX_USERNAME_LEN"
              type="text"
            />
            <div>Customize capitalization for your username</div>
          </div>
        </div>
        <div>
          <AppButton
            @click="handleSettingsSave"
            :disabled="!state.saveSettingsEnabled || state.savingSettings"
            class="account__settings__save account__btn"
          >
            Save Changes
          </AppButton>
        </div>
      </div>
    </section>
    <section>
      <h2>Delete Account</h2>
      <div class="account__delete-disclaimer">
        Once you delete your account, there is no going back. Please be certain.
      </div>
      <AppButton
        @click="state.deleteAccountModalActive = true"
        class="account__btn account__btn--red"
      >
        Delete your account
      </AppButton>
    </section>
  </div>
  <AppLoading v-else> Loading account </AppLoading>
</template>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

input {
  width: 100%;
  padding: 5px 10px;
  background-color: colors.$inp-bg;
  border: colors.$inp 1px solid;
  border-radius: 4px;

  &:focus {
    outline: 3px solid colors.$primary;
    outline-offset: -1px;
  }

  &:focus.error {
    outline-color: colors.$error;
  }
}

.delete-modal {
  input {
    margin: 4px 0;
  }

  &__btn {
    width: 100%;

    @include colors.app-button(colors.$error);
  }
}

.account {
  width: 1050px;
  max-width: 90vw;
  margin: 24px auto;

  h1 {
    font-size: 2.25rem;
    margin-bottom: 16px;
  }

  section {
    width: 100%;
    border-radius: 16px;
    background-color: colors.$light-surface;
    padding: 18px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 1.125rem;
    margin-bottom: 10px;
  }

  &__btn {
    font-size: 1em;
    padding: 6px 14px;

    &--red {
      @include colors.app-button(colors.$error);
    }
  }

  &__avatar {
    display: flex;
    align-items: center;
    gap: 16px;

    &__img {
      width: 96px;
      height: 96px;
      border-radius: 50%;
    }

    &__btns {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 6px;
    }
  }

  &__settings {
    &__row {
      display: flex;
      width: 100%;
      font-size: 0.9rem;
      margin-bottom: 18px;

      &__name {
        width: 22ch;
        font-weight: 700;
      }

      &__content {
        flex-grow: 1;

        div {
          margin-top: 8px;
          color: colors.$subtext;

          &.error {
            color: colors.$error;
          }
        }
      }
    }

    &__save {
      display: block;
      margin-left: auto;
      margin-right: 0;
    }
  }

  &__delete-disclaimer {
    margin-bottom: 6px;
    color: colors.$subtext;
  }
}
</style>
