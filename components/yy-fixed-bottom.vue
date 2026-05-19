<template>
  <view class="yy-fixed-bottom">
    <view
      class="!h-12 rounded-2xl flex items-center justify-center gap-2"
      :class="disabled ? 'bg-gray-300' : ''"
      :style="disabled ? {} : btnStyle"
      @click="onClick"
    >
      <yy-icon v-if="icon" :name="icon" size="18" color="#ffffff" />
      <text class="text-base font-semibold text-white">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
  const props = defineProps({
    text: { type: String, required: true },
    icon: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    btnStyle: { type: Object, default: () => ({}) },
  })

  const emit = defineEmits(['click'])

  function onClick() {
    if (props.disabled) return
    emit('click')
  }
</script>

<style lang="scss" scoped>
  .yy-fixed-bottom {
    padding: 12px 16px 24px;
    background: #ffffff;
    border-top: 1px solid #f3f4f6;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
    z-index: 100;
  }
</style>
