<template>
  <u-popup :value="modelValue" @input="onInput" mode="center" border-radius="20" width="640rpx" :mask-close-able="false">
    <view class="guide-popup-content">
      <view class="guide-popup-header">
        <view class="guide-popup-icon" :style="{ background: primaryLight }">
          <yy-icon name="ri:book-open-line" size="28" :color="primaryColor" />
        </view>
        <text class="guide-popup-title">欢迎使用挪车助手</text>
        <text class="guide-popup-subtitle">简单三步，快速上手</text>
      </view>

      <view class="guide-popup-steps">
        <view v-for="(step, index) in steps" :key="index" class="guide-popup-step">
          <view class="guide-popup-step-num" :style="{ background: primaryColor }">
            <text class="guide-popup-step-num-text">{{ index + 1 }}</text>
          </view>
          <view class="guide-popup-step-text">
            <text class="guide-popup-step-title">{{ step.title }}</text>
            <text class="guide-popup-step-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>

      <view class="guide-popup-btns">
        <view class="guide-popup-btn-skip" @click="handleSkip">
          <text class="guide-popup-btn-skip-text">暂不了解</text>
        </view>
        <view class="guide-popup-btn-primary" :style="primaryBtnStyle" @click="handleGoGuide">
          <text class="guide-popup-btn-primary-text">查看教程</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
  const props = defineProps({
    modelValue: { type: Boolean, default: false },
  })

  const emit = defineEmits(['update:modelValue', 'skip', 'goGuide'])

  const steps = [
    { title: '添加车辆信息', desc: '填写车牌号和联系电话' },
    { title: '生成挪车码', desc: '保存海报打印贴在车窗' },
    { title: '扫码联系车主', desc: '输入车牌或扫描二维码' },
  ]

  const primaryColor = computed(() => uni.$u.color.primary)
  const primaryLight = computed(() => uni.$u.color.primaryLight)

  const primaryBtnStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
  }))

  function onInput(val) {
    emit('update:modelValue', val)
  }

  function handleSkip() {
    emit('skip')
  }

  function handleGoGuide() {
    emit('goGuide')
  }
</script>

<style lang="scss" scoped>
  .guide-popup-content {
    padding: 24px;
  }

  .guide-popup-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .guide-popup-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .guide-popup-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .guide-popup-subtitle {
    font-size: 13px;
    color: #9ca3af;
  }

  .guide-popup-steps {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
  }

  .guide-popup-step {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .guide-popup-step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .guide-popup-step-num-text {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
  }

  .guide-popup-step-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .guide-popup-step-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .guide-popup-step-desc {
    font-size: 12px;
    color: #9ca3af;
  }

  .guide-popup-btns {
    display: flex;
    gap: 10px;
  }

  .guide-popup-btn-skip {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;

    &:active {
      opacity: 0.8;
    }
  }

  .guide-popup-btn-skip-text {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }

  .guide-popup-btn-primary {
    flex: 2;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.9;
    }
  }

  .guide-popup-btn-primary-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
</style>
