<template>
  <view class="page-container">
    <!-- 顶部背景 -->
    <view class="header-bg"></view>

    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: safeAreaTop + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <yy-icon name="ri:arrow-left-s-line" size="24" color="#ffffff" />
        </view>
        <text class="nav-title-text">联系车主</text>
        <view class="nav-back" style="opacity: 0;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ paddingTop: (safeAreaTop + 56) + 'px' }">
      <!-- 车牌展示 -->
      <view class="plate-show-section">
        <view class="plate-show-card">
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
            <view class="empty-btn-primary" @click="useFallback">
              <yy-icon name="ri:phone-line" size="16" color="#ffffff" />
              <text class="empty-btn-text">通过 122 求助</text>
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

        <view class="action-btn action-btn-call" @click="callPhone">
          <view class="action-icon-wrap" style="background: rgba(255,255,255,0.2);">
            <yy-icon name="ri:phone-fill" size="24" color="#ffffff" />
          </view>
          <view class="action-text-group">
            <text class="action-title">拨打电话</text>
            <text class="action-subtitle">直接致电车主</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#ffffff" />
        </view>

        <view class="action-btn action-btn-sms" @click="sendSMS">
          <view class="action-icon-wrap" style="background: #eff6ff;">
            <yy-icon name="ri:message-3-line" size="24" color="#2563eb" />
          </view>
          <view class="action-text-group">
            <text class="action-title-dark">发送短信</text>
            <text class="action-subtitle-dark">使用模板快速发送</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <!-- 短信模板 -->
        <view class="sms-templates" v-if="showTemplates">
          <text class="templates-title">选择短信模板</text>
          <view
            v-for="(tpl, idx) in smsTemplates"
            :key="idx"
            class="template-item"
            :class="{ 'template-item-active': selectedTemplate === idx }"
            @click="selectTemplate(idx)"
          >
            <view class="template-radio">
              <view v-if="selectedTemplate === idx" class="template-radio-inner"></view>
            </view>
            <text class="template-text">{{ tpl }}</text>
          </view>
          <view class="template-confirm-btn" @click="confirmSendSMS">
            <text class="template-confirm-text">发送选中模板</text>
          </view>
        </view>
      </view>

      <!-- 文明提示 -->
      <view class="warning-card" v-if="found && !searching">
        <yy-icon name="ri:error-warning-line" size="18" color="#d97706" />
        <view class="warning-content">
          <text class="warning-title">温馨提示</text>
          <text class="warning-text">请文明用语，理解车主可能因临时情况无法立即响应。如车辆紧急情况严重影响通行，可拨打 122 报警电话。</text>
        </view>
      </view>

      <view style="height: 40px;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
  const safeAreaTop = ref(0)
  const plate = ref('')
  const searching = ref(true)
  const found = ref(false)
  const showTemplates = ref(false)
  const selectedTemplate = ref(0)

  const ownerInfo = ref({
    plate: '',
    phone: '',
    carDesc: '',
    note: '',
    hidePhone: false,
  })

  const smsTemplates = ref([
    '您好，您的车牌为 {plate} 的车辆挡住了我的车，麻烦您方便时挪一下，谢谢！',
    '车主您好，我在 [位置] 需要出车，您的车有些挡路，麻烦尽快挪车，万分感谢！',
    '您好，您的车 {plate} 占用了车位/通道，请尽快挪车，谢谢配合！',
    '您好，请问您是 {plate} 车主吗？方便挪一下车吗？我等会儿，谢谢！',
  ])

  const displayPhone = computed(() => {
    if (!ownerInfo.value.phone) return ''
    if (ownerInfo.value.hidePhone) {
      return ownerInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
    return ownerInfo.value.phone
  })

  onLoad(options => {
    const sysInfo = uni.getSystemInfoSync()
    safeAreaTop.value = sysInfo.statusBarHeight || 0

    plate.value = decodeURIComponent(options.plate || '')

    // 来自扫码的直接传递信息
    if (options.type === 'scan' && options.phone) {
      ownerInfo.value = {
        plate: plate.value,
        phone: decodeURIComponent(options.phone),
        carDesc: '',
        note: decodeURIComponent(options.note || ''),
        hidePhone: false,
      }
      saveContactRecord()
      searching.value = false
      found.value = true
      return
    }

    // 模拟查询车主信息（实际应调用后端 API）
    setTimeout(() => {
      const myInfo = uni.getStorageSync('my_car_info')
      // 演示场景：如果输入的车牌就是自己设置的车牌，则返回自己的信息
      if (myInfo && myInfo.plate === plate.value) {
        ownerInfo.value = { ...myInfo }
        found.value = true
      } else {
        // 演示模式：模拟有车主信息（实际项目应改为后端查询失败 found = false）
        ownerInfo.value = {
          plate: plate.value,
          phone: '13800138000',
          carDesc: '',
          note: '',
          hidePhone: false,
        }
        found.value = true
      }

      saveContactRecord()
      searching.value = false
    }, 800)
  })

  function saveContactRecord() {
    const records = uni.getStorageSync('move_car_history') || []
    records.unshift({
      plate: plate.value,
      phone: ownerInfo.value.phone,
      time: Date.now(),
      type: 'sent',
    })
    uni.setStorageSync('move_car_history', records.slice(0, 100))
  }

  function callPhone() {
    if (!ownerInfo.value.phone) {
      uni.showToast({ title: '电话号码不可用', icon: 'none' })
      return
    }
    uni.makePhoneCall({
      phoneNumber: ownerInfo.value.phone,
      fail: () => {},
    })
  }

  function sendSMS() {
    showTemplates.value = !showTemplates.value
  }

  function selectTemplate(idx) {
    selectedTemplate.value = idx
  }

  function confirmSendSMS() {
    const tpl = smsTemplates.value[selectedTemplate.value].replace(/\{plate\}/g, plate.value)

    // #ifdef MP-WEIXIN
    uni.setClipboardData({
      data: tpl,
      success: () => {
        uni.showModal({
          title: '短信模板已复制',
          content: '由于小程序限制，无法直接发送短信。模板已复制到剪贴板，您可以粘贴到短信中发送。',
          confirmText: '去发短信',
          cancelText: '取消',
          confirmColor: '#2563eb',
          success: res => {
            if (res.confirm) {
              uni.makePhoneCall({ phoneNumber: ownerInfo.value.phone })
            }
          },
        })
      },
    })
    // #endif

    // #ifdef APP-PLUS || H5
    const url = `sms:${ownerInfo.value.phone}?body=${encodeURIComponent(tpl)}`
    plus && plus.runtime ? plus.runtime.openURL(url) : window.location.href = url
    // #endif
  }

  function useFallback() {
    uni.makePhoneCall({ phoneNumber: '122', fail: () => {} })
  }

  function goBack() {
    uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/index/index' }) })
  }
</script>

<style lang="scss" scoped>
  .page-container {
    min-height: 100vh;
    background: #f5f7fb;
    position: relative;
  }

  .header-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 200rpx;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #3b82f6 100%);
    z-index: 0;
  }

  .nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }

  .nav-content {
    height: 56px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    &:active { background: rgba(255, 255, 255, 0.15); }
  }

  .nav-title-text {
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
  }

  .page-scroll {
    height: 100vh;
    box-sizing: border-box;
  }

  /* 车牌展示 */
  .plate-show-section {
    position: relative;
    z-index: 10;
    padding: 8px 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .plate-show-card {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 12px 32px rgba(37, 99, 235, 0.35);
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
    0%, 100% { left: -50%; }
    50% { left: 100%; }
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
    margin: 0 16px;
    background: #ffffff;
    border-radius: 20px;
    padding: 24px 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    position: relative;
    z-index: 10;
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
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
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
    &:active { opacity: 0.85; }
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
    &:active { opacity: 0.9; transform: scale(0.99); }
  }

  .action-btn-call {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  }

  .action-btn-sms {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
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
      border-color: #2563eb;
      background: #eff6ff;
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
      border-color: #2563eb;
    }
  }

  .template-radio-inner {
    width: 8px;
    height: 8px;
    background: #2563eb;
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
    background: #2563eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:active { opacity: 0.9; }
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
