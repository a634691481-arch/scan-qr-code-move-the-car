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
        <text class="nav-title-text">挪车记录</text>
        <view class="nav-back" @click="clearRecords" v-if="records.length > 0">
          <yy-icon name="ri:delete-bin-line" size="20" color="#ffffff" />
        </view>
        <view class="nav-back" style="opacity: 0;" v-else></view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ paddingTop: (safeAreaTop + 56) + 'px' }">
      <!-- 统计头部 -->
      <view class="stat-section" v-if="records.length > 0">
        <view class="stat-card">
          <text class="stat-number">{{ records.length }}</text>
          <text class="stat-label">总记录</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ todayCount }}</text>
          <text class="stat-label">今日</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ weekCount }}</text>
          <text class="stat-label">本周</text>
        </view>
      </view>

      <!-- 记录列表 -->
      <view class="record-list" v-if="records.length > 0">
        <view
          class="record-card"
          v-for="(record, idx) in records"
          :key="idx"
          @click="onRecordTap(record)"
        >
          <view class="record-icon" :class="record.type === 'received' ? 'record-icon-received' : 'record-icon-sent'">
            <yy-icon
              :name="record.type === 'received' ? 'ri:phone-incoming-line' : 'ri:phone-outgoing-line'"
              size="20"
              :color="record.type === 'received' ? '#ea580c' : '#2563eb'"
            />
          </view>

          <view class="record-content">
            <view class="record-top">
              <text class="record-plate">{{ record.plate }}</text>
              <text class="record-time">{{ formatTime(record.time) }}</text>
            </view>
            <view class="record-bottom">
              <text class="record-type-tag" :class="record.type === 'received' ? 'tag-received' : 'tag-sent'">
                {{ record.type === 'received' ? '收到挪车请求' : '发起挪车请求' }}
              </text>
              <text class="record-phone" v-if="record.phone">{{ maskPhone(record.phone) }}</text>
            </view>
          </view>

          <yy-icon name="ri:arrow-right-s-line" size="20" color="#d1d5db" />
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-section" v-if="records.length === 0">
        <view class="empty-illustration">
          <yy-icon name="ri:inbox-line" size="64" color="#d1d5db" />
        </view>
        <text class="empty-title">暂无挪车记录</text>
        <text class="empty-desc">当您联系车主或收到挪车请求后，记录会显示在这里</text>
        <view class="empty-btn" @click="goHome">
          <text class="empty-btn-text">去首页查询</text>
        </view>
      </view>

      <view style="height: 40px;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
  const safeAreaTop = ref(0)
  const records = ref([])

  const todayCount = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return records.value.filter(r => r.time >= today.getTime()).length
  })

  const weekCount = computed(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return records.value.filter(r => r.time >= weekAgo).length
  })

  onLoad(() => {
    const sysInfo = uni.getSystemInfoSync()
    safeAreaTop.value = sysInfo.statusBarHeight || 0
  })

  onShow(() => {
    loadRecords()
  })

  function loadRecords() {
    const history = uni.getStorageSync('move_car_history') || []
    records.value = history
  }

  function formatTime(timestamp) {
    const d = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`

    const isThisYear = d.getFullYear() === now.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')

    if (isThisYear) return `${month}-${day} ${hour}:${min}`
    return `${d.getFullYear()}-${month}-${day} ${hour}:${min}`
  }

  function maskPhone(phone) {
    if (!phone || phone.length < 7) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  function onRecordTap(record) {
    if (record.phone) {
      uni.showActionSheet({
        itemList: ['拨打电话', '再次联系'],
        success: res => {
          if (res.tapIndex === 0) {
            uni.makePhoneCall({ phoneNumber: record.phone, fail: () => {} })
          } else {
            uni.navigateTo({
              url: `/pages/contact/index?plate=${encodeURIComponent(record.plate)}&type=call`,
            })
          }
        },
      })
    }
  }

  function clearRecords() {
    uni.showModal({
      title: '清除记录',
      content: '确定要清除所有挪车记录吗？',
      confirmText: '清除',
      confirmColor: '#ef4444',
      success: res => {
        if (res.confirm) {
          uni.setStorageSync('move_car_history', [])
          records.value = []
          uni.showToast({ title: '已清除', icon: 'success' })
        }
      },
    })
  }

  function goHome() {
    uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/index/index' }) })
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

  /* 统计卡片 */
  .stat-section {
    display: flex;
    gap: 10px;
    padding: 12px 16px 0;
    position: relative;
    z-index: 10;
  }

  .stat-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .stat-number {
    font-size: 26px;
    font-weight: 800;
    color: #2563eb;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }

  /* 记录列表 */
  .record-list {
    padding: 12px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .record-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    &:active { background: #f9fafb; }
  }

  .record-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .record-icon-sent {
    background: #eff6ff;
  }

  .record-icon-received {
    background: #fff7ed;
  }

  .record-content {
    flex: 1;
    overflow: hidden;
  }

  .record-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .record-plate {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 0.5px;
  }

  .record-time {
    font-size: 12px;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .record-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .record-type-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .tag-sent {
    background: #eff6ff;
    color: #2563eb;
  }

  .tag-received {
    background: #fff7ed;
    color: #ea580c;
  }

  .record-phone {
    font-size: 12px;
    color: #9ca3af;
  }

  /* 空状态 */
  .empty-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 32px 0;
  }

  .empty-illustration {
    width: 100px;
    height: 100px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .empty-title {
    font-size: 17px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 13px;
    color: #6b7280;
    text-align: center;
    margin-bottom: 28px;
    line-height: 1.6;
  }

  .empty-btn {
    height: 44px;
    padding: 0 32px;
    background: #2563eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:active { opacity: 0.9; }
  }

  .empty-btn-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
</style>
