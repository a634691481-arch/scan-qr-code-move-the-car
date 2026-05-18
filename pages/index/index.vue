<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- Hero 区域 -->
      <view class="hero-section">
        <view class="hero-card">
          <view class="hero-icon-wrap">
            <yy-icon name="ri:car-washing-line" size="48" color="#2563eb" />
          </view>
          <view class="hero-texts">
            <text class="hero-title">快速联系车主挪车</text>
            <text class="hero-subtitle">输入车牌号，一键联系</text>
          </view>
        </view>
      </view>

      <!-- 主操作卡片 -->
      <view class="main-card">
        <!-- 车牌输入区 -->
        <view class="plate-section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-label">请输入车牌号码</text>
          </view>

          <!-- 车牌展示框 -->
          <view class="plate-display" @click="showPlateKeyboard">
            <template v-for="(char, idx) in plateChars" :key="idx">
              <view v-if="idx === 2" class="plate-separator-dot"></view>
              <view
                class="plate-cell"
                :class="{
                  'plate-cell-filled': char,
                  'plate-cell-active': idx === currentInputIndex,
                  'plate-cell-province': idx === 0,
                }"
              >
                <text class="plate-cell-text">{{ char || '' }}</text>
                <view v-if="!char && idx === currentInputIndex" class="plate-cursor"></view>
              </view>
            </template>
          </view>

          <!-- 历史搜索 -->
          <view v-if="historyPlates.length > 0" class="history-section">
            <view class="history-header">
              <text class="history-title">历史搜索</text>
              <text class="history-clear" @click="clearHistory">清除</text>
            </view>
            <view class="history-tags">
              <view v-for="plate in historyPlates" :key="plate" class="history-tag" @click="fillHistory(plate)">
                <yy-icon name="ri:time-line" size="12" color="#6b7280" />
                <text class="history-tag-text">{{ plate }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系方式选择（填写车牌后显示） -->
        <view v-if="plateValue.length >= 7" class="contact-actions">
          <view class="contact-tip">
            <yy-icon name="ri:information-line" size="14" color="#6b7280" />
            <text class="contact-tip-text">将向该车辆车主发起挪车请求</text>
          </view>
          <view class="btn-row">
            <view class="btn-call" @click="contactOwner('call')">
              <yy-icon name="ri:phone-line" size="20" color="#ffffff" />
              <text class="btn-text">电话联系</text>
            </view>
            <view class="btn-msg" @click="contactOwner('sms')">
              <yy-icon name="ri:message-3-line" size="20" color="#2563eb" />
              <text class="btn-msg-text">发送短信</text>
            </view>
          </view>
        </view>

        <!-- 扫码入口 -->
        <view class="scan-entry" @click="scanQRCode">
          <view class="scan-icon-wrap">
            <yy-icon name="ri:qr-scan-2-line" size="24" color="#2563eb" />
          </view>
          <view class="scan-texts">
            <text class="scan-title">扫描挪车码</text>
            <text class="scan-desc">扫描车主贴在车上的二维码直接联系</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>
      </view>

      <!-- 功能入口卡片 -->
      <view class="feature-row">
        <view class="feature-card" @click="toMy">
          <view class="feature-icon" style="background: #eff6ff">
            <yy-icon name="ri:car-line" size="28" color="#2563eb" />
          </view>
          <text class="feature-label">我的车辆</text>
          <text class="feature-desc">设置车牌信息</text>
        </view>
        <view class="feature-card" @click="toQrcode">
          <view class="feature-icon" style="background: #f0fdf4">
            <yy-icon name="ri:qr-code-line" size="28" color="#16a34a" />
          </view>
          <text class="feature-label">挪车码</text>
          <text class="feature-desc">生成专属二维码</text>
        </view>
        <view class="feature-card" @click="toHistory">
          <view class="feature-icon" style="background: #fff7ed">
            <yy-icon name="ri:history-line" size="28" color="#ea580c" />
          </view>
          <text class="feature-label">挪车记录</text>
          <text class="feature-desc">联系历史</text>
        </view>
      </view>

      <!-- 使用说明 -->
      <view class="tips-card">
        <view class="tips-header">
          <yy-icon name="ri:lightbulb-line" size="16" color="#d97706" />
          <text class="tips-title">使用提示</text>
        </view>
        <view class="tips-list">
          <view class="tip-item">
            <text class="tip-num">1</text>
            <text class="tip-text">输入需要挪车的车牌号，点击"电话联系"或"发送短信"</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">2</text>
            <text class="tip-text">进入"我的车辆"设置您的车牌、电话和联系说明</text>
          </view>
          <view class="tip-item">
            <text class="tip-num">3</text>
            <text class="tip-text">生成您的专属挪车码，打印后贴在车窗上</text>
          </view>
        </view>
      </view>

      <view style="height: 40rpx"></view>
    </view>
  </yy-paging>

  <!-- 车牌输入键盘弹框 -->
  <yy-plate-keyboard v-model:visible="keyboardVisible" v-model="plateValue" />
</template>

<script setup>
  // ====== yy-paging 配置 ======
  const pagingConfig = ref({
    auto: false,
    refresherEnabled: true,
    showRefresherWhenReload: false,
    loadingMoreEnabled: false,
    showTabbar: false,
    hideNav: false,
    showNavBack: false,
    navTitle: '挪车助手',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const keyboardVisible = ref(false)
  const plateValue = ref('')

  // 从存储加载历史记录
  const historyPlates = ref([])

  // 当前输入光标位置
  const currentInputIndex = computed(() => {
    return Math.min(plateValue.value.length, 7)
  })

  // 车牌字符数组（最多8位）
  const plateChars = computed(() => {
    const chars = plateValue.value.split('')
    while (chars.length < 8) chars.push('')
    return chars
  })

  onLoad(() => {
    loadHistory()
  })

  onShow(() => {
    loadHistory()
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  function loadHistory() {
    const history = uni.getStorageSync('plate_search_history') || []
    historyPlates.value = history.slice(0, 6)
  }

  function showPlateKeyboard() {
    keyboardVisible.value = true
  }

  function fillHistory(plate) {
    plateValue.value = plate
  }

  function clearHistory() {
    uni.setStorageSync('plate_search_history', [])
    historyPlates.value = []
  }

  function saveHistory(plate) {
    let history = uni.getStorageSync('plate_search_history') || []
    history = history.filter(p => p !== plate)
    history.unshift(plate)
    history = history.slice(0, 10)
    uni.setStorageSync('plate_search_history', history)
  }

  function contactOwner(type) {
    const plate = plateValue.value.trim()
    if (plate.length < 7) {
      uni.showToast({ title: '请输入完整车牌号', icon: 'none' })
      return
    }

    // 保存历史
    saveHistory(plate)

    // 跳转到联系页
    uni.navigateTo({
      url: `/pages/index/contact?plate=${encodeURIComponent(plate)}&type=${type}`,
    })
  }

  function scanQRCode() {
    uni.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode'],
      success: res => {
        try {
          const data = JSON.parse(res.result)
          if (data.plate && data.phone) {
            uni.navigateTo({
              url: `/pages/index/contact?plate=${encodeURIComponent(data.plate)}&phone=${encodeURIComponent(data.phone)}&note=${encodeURIComponent(data.note || '')}&type=scan`,
            })
          } else {
            uni.showToast({ title: '无效的挪车码', icon: 'none' })
          }
        } catch {
          uni.showToast({ title: '无效的二维码格式', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '扫码取消', icon: 'none' })
      },
    })
  }

  function toMy() {
    uni.navigateTo({ url: '/pages/my/index' })
  }

  function toQrcode() {
    uni.navigateTo({ url: '/pages/my/qrcode' })
  }

  function toHistory() {
    uni.navigateTo({ url: '/pages/my/history' })
  }
</script>

<style lang="scss" scoped>
  .page-content {
    min-height: 100vh;
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* Hero 区域 */
  .hero-section {
    padding: 12px 16px 0;
  }

  .hero-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #3b82f6 100%);
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
  }

  .hero-icon-wrap {
    width: 72px;
    height: 72px;
    background: #ffffff;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
    flex-shrink: 0;
  }

  .hero-title {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 4px;
  }

  .hero-subtitle {
    display: block;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  /* 主卡片 */
  .main-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 24px;
    padding: 24px 20px 20px;
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.08);
  }

  /* 输入区 */
  .plate-section {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .section-dot {
    width: 4px;
    height: 16px;
    background: #2563eb;
    border-radius: 2px;
  }

  .section-label {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }

  /* 车牌展示框 */
  .plate-display {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 0 16px;
    justify-content: center;
  }

  .plate-cell {
    width: 44px;
    height: 54px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    position: relative;
    transition: all 0.2s;

    &.plate-cell-active {
      border-color: #2563eb;
      background: #eff6ff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    &.plate-cell-filled {
      border-color: #2563eb;
      background: #ffffff;
    }

    &.plate-cell-province {
      background: #2563eb;
      border-color: #2563eb;

      .plate-cell-text {
        color: #ffffff;
        font-weight: 700;
      }

      &.plate-cell-active {
        background: #1d4ed8;
        border-color: #1d4ed8;
      }
    }
  }

  .plate-separator-dot {
    width: 8px;
    height: 8px;
    background: #2563eb;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 2px;
  }

  .plate-cell-text {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 0;
  }

  .plate-cursor {
    position: absolute;
    width: 2px;
    height: 26px;
    background: #2563eb;
    border-radius: 1px;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    height: 1px;
    width: 1px;
    z-index: -1;
  }

  /* 历史搜索 */
  .history-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .history-title {
    font-size: 12px;
    color: #6b7280;
  }

  .history-clear {
    font-size: 12px;
    color: #9ca3af;
  }

  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .history-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #f3f4f6;
    border-radius: 20px;
    &:active {
      opacity: 0.7;
    }
  }

  .history-tag-text {
    font-size: 12px;
    color: #374151;
  }

  /* 虚拟键盘 */
  .keyboard-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
  }

  .keyboard-row {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .province-row {
    gap: 4px;
  }

  .key-btn {
    min-width: 38px;
    height: 42px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    max-width: 46px;

    &:active {
      background: #e2e8f0;
      transform: scale(0.95);
    }

    &.key-btn-num {
      max-width: 36px;
    }

    &.key-btn-delete {
      background: #fee2e2;
      max-width: 50px;
      min-width: 50px;
    }

    &.key-btn-disabled {
      opacity: 0.3;
    }
  }

  .key-text {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .keyboard-footer {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .key-clear-btn {
    flex: 1;
    height: 44px;
    background: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:active {
      opacity: 0.7;
    }
  }

  .key-clear-text {
    font-size: 14px;
    color: #6b7280;
  }

  .key-confirm-btn {
    flex: 2;
    height: 44px;
    background: #2563eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:active {
      opacity: 0.85;
    }
  }

  .key-confirm-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  /* 联系操作区 */
  .contact-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #f3f4f6;
  }

  .contact-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
    padding: 8px 12px;
    background: #eff6ff;
    border-radius: 10px;
  }

  .contact-tip-text {
    font-size: 12px;
    color: #3b82f6;
  }

  .btn-row {
    display: flex;
    gap: 12px;
  }

  .btn-call {
    flex: 1;
    height: 50px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  .btn-text {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
  }

  .btn-msg {
    flex: 1;
    height: 50px;
    background: #eff6ff;
    border-radius: 14px;
    border: 1.5px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    &:active {
      opacity: 0.8;
    }
  }

  .btn-msg-text {
    font-size: 15px;
    font-weight: 600;
    color: #2563eb;
  }

  /* 扫码入口 */
  .scan-entry {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    margin-top: 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 16px;
    border: 1px solid #bae6fd;
    &:active {
      opacity: 0.8;
    }
  }

  .scan-icon-wrap {
    width: 48px;
    height: 48px;
    background: #ffffff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
    flex-shrink: 0;
  }

  .scan-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #0c4a6e;
    margin-bottom: 2px;
  }

  .scan-desc {
    display: block;
    font-size: 12px;
    color: #0284c7;
  }

  /* 功能入口 */
  .feature-row {
    display: flex;
    gap: 10px;
    margin: 12px 16px 0;
  }

  .feature-card {
    flex: 1;
    background: #ffffff;
    border-radius: 18px;
    padding: 18px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    &:active {
      opacity: 0.8;
      transform: scale(0.97);
    }
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-label {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
  }

  .feature-desc {
    font-size: 11px;
    color: #9ca3af;
  }

  /* 使用说明 */
  .tips-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 18px;
    padding: 18px 18px 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
  }

  .tips-title {
    font-size: 14px;
    font-weight: 600;
    color: #92400e;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .tip-num {
    width: 20px;
    height: 20px;
    background: #fef3c7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #d97706;
    flex-shrink: 0;
    line-height: 20px;
    text-align: center;
  }

  .tip-text {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    flex: 1;
  }
</style>
