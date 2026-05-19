<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 车牌展示 -->
      <view class="plate-show-section" :style="plateShowSectionStyle">
        <view class="plate-show-card" :style="plateShowCardStyle">
          <view class="plate-shine"></view>
          <view class="plate-content">
            <view class="plate-province">{{ plate.charAt(0) }}</view>
            <text class="plate-letter">{{ plate.charAt(1) }}</text>
            <view class="plate-dot"></view>
            <text v-for="(c, i) in plate.slice(2)" :key="i" class="plate-letter">{{ c }}</text>
          </view>
        </view>
        <text class="plate-show-tip">即将联系该车辆车主</text>
      </view>

      <!-- 状态卡片 -->
      <view class="status-card">
        <view v-if="searching" class="status-loading">
          <view class="loading-circle"></view>
          <text class="status-text">正在查询车主信息...</text>
        </view>
        <view v-else-if="!found" class="status-empty">
          <view class="empty-icon">
            <yy-icon name="ri:search-eye-line" size="48" color="#9ca3af" />
          </view>
          <text class="empty-title">未找到该车辆信息</text>
          <text class="empty-desc">该车主可能尚未注册挪车助手</text>
          <view class="empty-actions">
            <view class="empty-btn-primary" @click="call114">
              <yy-icon name="ri:phone-line" size="16" color="#ffffff" />
              <text class="empty-btn-text">拨打 114 查询</text>
            </view>
            <view class="empty-btn-secondary" @click="goBack">
              <text class="empty-btn-secondary-text">返回</text>
            </view>
          </view>
        </view>
        <view v-else class="status-found">
          <view class="found-header">
            <view class="found-icon">
              <yy-icon name="ri:check-line" size="20" color="#ffffff" />
            </view>
            <view class="found-info">
              <text class="found-title">找到车主联系方式</text>
              <text class="found-desc">请文明礼貌沟通，感谢配合</text>
            </view>
          </view>

          <!-- 车主信息 -->
          <view class="owner-info">
            <view class="info-row" v-if="ownerInfo.carDesc">
              <text class="info-label">车辆描述</text>
              <text class="info-value">{{ ownerInfo.carDesc }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">联系电话</text>
              <text class="info-value">{{ displayPhone }}</text>
            </view>
            <view class="info-row" v-if="ownerInfo.subPhone">
              <text class="info-label">副号</text>
              <text class="info-value">{{ ownerInfo.subPhone }}</text>
            </view>
            <view class="info-row" v-if="ownerInfo.note">
              <text class="info-label">联系说明</text>
              <text class="info-value">{{ ownerInfo.note }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 联系操作 -->
      <view v-if="found && !searching" class="contact-actions-card">
        <text class="action-section-title">选择联系方式</text>

        <view class="action-btn action-btn-call" :style="actionBtnCallStyle" @click="callPhone">
          <view class="action-icon-wrap" style="background: rgba(255, 255, 255, 0.2)">
            <yy-icon name="ri:phone-fill" size="24" color="#ffffff" />
          </view>
          <view class="action-text-group">
            <text class="action-title">拨打电话</text>
            <text class="action-subtitle">直接致电车主</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#ffffff" />
        </view>

        <view
          v-if="ownerInfo.pushToken"
          class="action-btn action-btn-notify"
          :class="{ 'action-btn-disabled': notifyCountdown > 0 }"
          @click="sendNotify"
        >
          <view class="action-icon-wrap" style="background: #dbeafe">
            <yy-icon
              name="ri:notification-3-fill"
              size="24"
              :color="notifyCountdown > 0 ? '#9ca3af' : uni.$u.color.primary"
            />
          </view>
          <view class="action-text-group">
            <text class="action-title-dark" :class="{ 'action-title-disabled': notifyCountdown > 0 }">
              {{ notifyCountdown > 0 ? `已发送（${notifyCountdown}s）` : '发送挪车通知' }}
            </text>
            <text class="action-subtitle-dark">通过公众号推送消息给车主</text>
          </view>
          <yy-icon v-if="notifyCountdown === 0" name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>
      </view>

      <!-- 文明提示 -->
      <view class="warning-card" v-if="found && !searching">
        <yy-icon name="ri:error-warning-line" size="18" color="#d97706" />
        <view class="warning-content">
          <text class="warning-title">温馨提示</text>
          <text class="warning-text">
            请文明用语，理解车主可能因临时情况无法立即响应。如车辆紧急情况严重影响通行，可拨打 122 报警电话。
          </text>
        </view>
      </view>

      <view style="height: 40rpx"></view>
    </view>
  </yy-paging>
</template>

<script setup>
  // ====== yy-paging 配置 ======
  const pagingConfig = ref({
    auto: false,
    refresherEnabled: false,
    showRefresherWhenReload: false,
    loadingMoreEnabled: false,
    showTabbar: false,
    hideNav: false,
    showNavBack: true,
    navTitle: '联系车主',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const plate = ref('')
  const searching = ref(true)
  const found = ref(false)

  const ownerInfo = ref({
    plate: '',
    phone: '',
    subPhone: '',
    carDesc: '',
    note: '',
    hidePhone: false,
    pushToken: '',
  })

  // 发送通知倒计时（防重复点击）
  const notifyCountdown = ref(0)
  let notifyTimer = null

  const displayPhone = computed(() => {
    if (!ownerInfo.value.phone) return ''
    if (ownerInfo.value.hidePhone) {
      return ownerInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
    return ownerInfo.value.phone
  })

  const plateShowSectionStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary} 0%, ${uni.$u.color.primary} 60%, ${uni.$u.color.primary} 100%)`,
  }))

  const plateShowCardStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primaryDark}, ${uni.$u.color.primary})`,
    boxShadow: `0 12px 32px ${uni.$u.color.primary}59`,
  }))

  const actionBtnCallStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
    boxShadow: `0 6px 16px ${uni.$u.color.primary}4d`,
  }))

  onLoad(options => {
    plate.value = decodeURIComponent(options.plate || '')

    // 来自API查询的车主数据（搜索或扫码）
    if (options.owner) {
      try {
        const data = JSON.parse(decodeURIComponent(options.owner))
        ownerInfo.value = {
          plate: data.plate || plate.value,
          phone: data.phone || '',
          subPhone: data.subPhone || '',
          carDesc: data.carDesc || '',
          note: data.note || '',
          ownerName: data.ownerName || '',
          hidePhone: data.hidePhone || false,
          pushToken: data.pushToken || '',
        }
        searching.value = false
        found.value = true
      } catch {
        searching.value = false
        found.value = false
      }
      return
    }

    // 无任何数据
    searching.value = false
    found.value = false
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  async function callPhone() {
    const phone = ownerInfo.value.phone
    const subPhone = ownerInfo.value.subPhone
    if (!phone && !subPhone) {
      vk.toast('电话号码不可用')
      return
    }

    const targetPhone = phone || subPhone
    uni.makePhoneCall({ phoneNumber: targetPhone, fail: () => {} })

    // 记录联系历史
    await addContactRecord('phone')
  }

  async function addContactRecord(contactType) {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) return
    try {
      await vk.callFunction({
        url: 'client/pub_index.addContactHistory',
        data: {
          uid,
          plate: ownerInfo.value.plate,
          contactType,
          ownerPhone: ownerInfo.value.phone,
        },
        needAlert: false,
      })
    } catch (err) {
      // 静默失败，不影响主流程
    }
  }

  function call114() {
    uni.makePhoneCall({ phoneNumber: '114', fail: () => {} })
  }

  async function sendNotify() {
    // 倒计时期间禁止点击
    if (notifyCountdown.value > 0) {
      vk.toast(`请等待 ${notifyCountdown.value} 秒后再发送`)
      return
    }

    const token = ownerInfo.value.pushToken
    if (!token) {
      vk.toast('该车主未配置推送通道')
      return
    }

    vk.showLoading({ title: '发送中...', mask: true })

    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.sendMoveCarNotify',
        data: {
          plate: ownerInfo.value.plate,
          token,
        },
        needAlert: false,
      })
      vk.hideLoading()

      if (res.code === 0) {
        vk.toast('通知已发送')
        await addContactRecord('notify')
        startNotifyCountdown()
      } else {
        vk.toast(res.msg || '发送失败')
      }
    } catch (err) {
      vk.hideLoading()
      vk.toast('发送失败，超出次数限制')
    }
  }

  // 启动发送通知倒计时（60秒）
  function startNotifyCountdown() {
    notifyCountdown.value = 8
    if (notifyTimer) {
      clearInterval(notifyTimer)
    }
    notifyTimer = setInterval(() => {
      notifyCountdown.value--
      if (notifyCountdown.value <= 0) {
        clearInterval(notifyTimer)
        notifyTimer = null
      }
    }, 1000)
  }

  onUnload(() => {
    if (notifyTimer) {
      clearInterval(notifyTimer)
      notifyTimer = null
    }
  })

  function goBack() {
    vk.navigateBack({ fail: () => vk.navigateTo('/pages/index/index') })
  }
</script>

<style lang="scss" scoped>
  .page-content {
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* 车牌展示 */
  .plate-show-section {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .plate-show-card {
    border-radius: 16px;
    padding: 16px 20px;
    border: 3px solid #ffffff;
    position: relative;
    overflow: hidden;
  }

  .plate-shine {
    position: absolute;
    top: 0;
    left: -50%;
    width: 60%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shine 3s ease-in-out infinite;
  }

  @keyframes shine {
    0%,
    100% {
      left: -50%;
    }
    50% {
      left: 100%;
    }
  }

  .plate-content {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
  }

  .plate-province {
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    padding-right: 4px;
  }

  .plate-letter {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 1px;
  }

  .plate-dot {
    width: 5px;
    height: 5px;
    background: #ffffff;
    border-radius: 50%;
    margin: 0 4px;
  }

  .plate-show-tip {
    margin-top: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.95);
  }

  /* 状态卡片 */
  .status-card {
    margin: 16px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 24px 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .status-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px 0;
  }

  .loading-circle {
    width: 36px;
    height: 36px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--u-type-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .status-text {
    font-size: 14px;
    color: #6b7280;
  }

  /* 未找到状态 */
  .status-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 24px;
  }

  .empty-actions {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .empty-btn-primary {
    flex: 1;
    height: 44px;
    background: #ef4444;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    &:active {
      opacity: 0.85;
    }
  }

  .empty-btn-text {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
  }

  .empty-btn-secondary {
    flex: 1;
    height: 44px;
    background: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-btn-secondary-text {
    font-size: 14px;
    color: #6b7280;
  }

  /* 找到状态 */
  .found-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 18px;
    border-bottom: 1px dashed #e5e7eb;
    margin-bottom: 18px;
  }

  .found-icon {
    width: 36px;
    height: 36px;
    background: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .found-info {
    flex: 1;
  }

  .found-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }

  .found-desc {
    display: block;
    font-size: 12px;
    color: #6b7280;
  }

  .owner-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .info-label {
    width: 72px;
    font-size: 13px;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .info-value {
    flex: 1;
    font-size: 14px;
    color: #1f2937;
    word-break: break-all;
  }

  /* 联系操作 */
  .contact-actions-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .action-section-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 14px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border-radius: 14px;
    margin-bottom: 12px;
    &:active {
      opacity: 0.9;
      transform: scale(0.99);
    }
  }

  .action-btn-call {
    /* background 和 box-shadow 通过 :style 绑定 actionBtnCallStyle */
  }

  .action-btn-sms {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .action-btn-notify {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    margin-bottom: 0;

    &.action-btn-disabled {
      opacity: 0.6;
      background: #f3f4f6;
      border-color: #e5e7eb;
    }
  }

  .action-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-text-group {
    flex: 1;
  }

  .action-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 2px;
  }

  .action-title-dark {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;

    &.action-title-disabled {
      color: #9ca3af;
    }
  }

  .action-subtitle {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }

  .action-subtitle-dark {
    display: block;
    font-size: 12px;
    color: #9ca3af;
  }

  /* 短信模板 */
  .sms-templates {
    margin-top: 8px;
    padding: 14px;
    background: #f9fafb;
    border-radius: 14px;
  }

  .templates-title {
    display: block;
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 10px;
  }

  .template-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background: #ffffff;
    border-radius: 10px;
    margin-bottom: 8px;
    border: 1.5px solid transparent;

    &.template-item-active {
      border-color: var(--u-type-primary);
      background: var(--u-type-primary-light);
    }
  }

  .template-radio {
    width: 18px;
    height: 18px;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;

    .template-item-active & {
      border-color: var(--u-type-primary);
    }
  }

  .template-radio-inner {
    width: 8px;
    height: 8px;
    background: var(--u-type-primary);
    border-radius: 50%;
  }

  .template-text {
    flex: 1;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
  }

  .template-confirm-btn {
    margin-top: 4px;
    height: 42px;
    background: var(--u-type-primary);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:active {
      opacity: 0.9;
    }
  }

  .template-confirm-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  /* 提示卡片 */
  .warning-card {
    margin: 12px 16px 0;
    padding: 14px 16px;
    background: #fffbeb;
    border-radius: 14px;
    border: 1px solid #fde68a;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .warning-content {
    flex: 1;
  }

  .warning-title {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 4px;
  }

  .warning-text {
    display: block;
    font-size: 12px;
    color: #b45309;
    line-height: 1.5;
  }
</style>
