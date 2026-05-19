<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="flex flex-col gap-3 p-3">
      <!-- 反馈类型 -->
      <view class="rounded-2xl flex-col gap-3 p-4 bg-white shadow-sm">
        <text class="text-sm font-semibold text-gray-900">反馈类型</text>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="item in feedbackTypes"
            :key="item.value"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border"
            :class="form.type === item.value ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white'"
            :style="
              form.type === item.value ? { borderColor: uni.$u.color.primary, background: uni.$u.color.primaryLight } : {}
            "
            @click="form.type = item.value"
          >
            <yy-icon :name="item.icon" size="16" :color="form.type === item.value ? uni.$u.color.primary : '#9ca3af'" />
            <text class="text-sm font-medium" :class="form.type === item.value ? 'text-gray-800' : 'text-gray-500'">
              {{ item.label }}
            </text>
          </view>
        </view>
      </view>

      <!-- 反馈内容 -->
      <view class="rounded-2xl flex-col gap-3 p-4 bg-white shadow-sm">
        <text class="text-sm font-semibold text-gray-900">反馈内容</text>
        <textarea
          v-model="form.content"
          class="min-h-36 bg-gray-50 rounded-xl w-full p-3 text-sm leading-relaxed text-gray-900"
          placeholder="请详细描述您遇到的问题或建议，我们会尽快处理..."
          placeholder-class="text-sm text-gray-400"
          maxlength="500"
          :show-confirm-bar="false"
        />
        <text class="text-xs text-right text-gray-400">{{ form.content.length }}/500</text>
      </view>

      <!-- 联系方式 -->
      <view class="rounded-2xl flex-col gap-3 p-4 bg-white shadow-sm">
        <text class="text-sm font-semibold text-gray-900">联系方式（选填）</text>
        <input
          v-model="form.contact"
          class="bg-gray-50 rounded-xl w-full h-12 px-3 text-sm text-gray-900"
          placeholder="手机号或微信号，方便我们联系您"
          placeholder-class="text-sm text-gray-400"
          maxlength="50"
        />
      </view>
    </view>

    <!-- 底部固定提交区 -->
    <template #bottom>
      <yy-fixed-bottom
        text="提交反馈"
        icon="ri:send-plane-line"
        :disabled="!canSubmit"
        :btn-style="submitBtnStyle"
        @click="submitFeedback"
      />
    </template>
  </yy-paging>
</template>

<script setup>
  const pagingConfig = ref({
    auto: false,
    refresherEnabled: false,
    showRefresherWhenReload: false,
    showTabbar: false,
    hideNav: false,
    showNavBack: true,
    navTitle: '用户反馈',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  const form = ref({
    type: 'suggest',
    content: '',
    contact: '',
  })

  const feedbackTypes = [
    { label: '功能建议', value: 'suggest', icon: 'ri:lightbulb-line' },
    { label: '问题反馈', value: 'bug', icon: 'ri:bug-line' },
    { label: '使用咨询', value: 'consult', icon: 'ri:question-line' },
    { label: '账号异常', value: 'account', icon: 'ri:shield-user-line' },
    { label: '性能卡顿', value: 'performance', icon: 'ri:timer-flash-line' },
    { label: '其他', value: 'other', icon: 'ri:more-line' },
  ]

  const canSubmit = computed(() => {
    return form.value.type && form.value.content.trim().length >= 5
  })

  const submitBtnStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
    boxShadow: `0 6px 16px ${uni.$u.color.primary}4d`,
  }))

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  async function submitFeedback() {
    if (!canSubmit.value) {
      if (!form.value.type) {
        vk.toast('请选择反馈类型')
        return
      }
      if (form.value.content.trim().length < 5) {
        vk.toast('反馈内容至少5个字')
        return
      }
    }

    vk.showLoading({ title: '提交中...', mask: true })

    try {
      const uid = vk.getStorageSync('uni_id_token') || ''
      const res = await vk.callFunction({
        url: 'client/pub_index.addFeedback',
        data: {
          uid,
          type: form.value.type,
          content: form.value.content.trim(),
          contact: form.value.contact.trim(),
        },
        needAlert: false,
      })

      vk.hideLoading()

      if (res.code === 0) {
        vk.toast('提交成功，感谢您的反馈！')
        form.value.content = ''
        form.value.contact = ''
        setTimeout(() => {
          vk.navigateBack()
        }, 1500)
      } else {
        vk.toast(res.msg || '提交失败，请重试')
      }
    } catch (err) {
      vk.hideLoading()
      vk.toast(err.msg || '提交失败，请重试')
    }
  }
</script>

<style lang="scss" scoped></style>
