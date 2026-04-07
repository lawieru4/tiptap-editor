<script setup lang="ts">
import { reactive } from 'vue'
import { useUser } from '@/hooks/useUser'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'

const { login, loginLoading, loginError } = useUser()

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  login(form)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
    <Card class="w-full max-w-md shadow-xl">
      <template #title>
        <div class="text-center text-2xl font-bold text-primary-600 mb-2">Welcome Back</div>
      </template>
      <template #subtitle>
        <div class="text-center text-surface-500 mb-6">Please sign in to your account</div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          
          <FloatLabel variant="on">
            <InputText 
              id="username" 
              v-model="form.username" 
              class="w-full"
              :invalid="!!loginError" 
            />
            <label for="username">Username</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <Password 
              id="password" 
              v-model="form.password" 
              class="w-full" 
              :invalid="!!loginError" 
              :feedback="false"
              toggleMask
              inputClass="w-full"
            />
            <label for="password">Password</label>
          </FloatLabel>

          <div v-if="loginError" class="text-red-500 text-sm text-center">
            {{ loginError.message || 'Login failed, please try again.' }}
          </div>

          <Button 
            type="submit" 
            label="Sign In" 
            icon="pi pi-sign-in" 
            :loading="loginLoading" 
            class="w-full" 
          />
        </form>
      </template>
    </Card>
  </div>
</template>
