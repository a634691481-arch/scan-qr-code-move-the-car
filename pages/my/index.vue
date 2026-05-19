<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 用户头像区 -->
      <view class="profile-section" :style="profileSectionStyle">
        <view class="avatar-wrap" :style="avatarWrapStyle">
          <view class="avatar" :style="avatarStyle">
            <yy-icon name="ri:user-3-fill" size="40" color="#ffffff" />
          </view>
        </view>
        <text class="profile-name">车主用户</text>
        <text v-if="carPlateDesc" class="profile-plate">{{ carPlateDesc }}</text>
      </view>

      <!-- 车辆信息入口卡片 -->
      <view class="info-entry-card" @click="toCarManage">
        <view class="info-entry-left">
          <view class="card-icon">
            <yy-icon name="ri:car-line" size="20" :color="uni.$u.color.primary" />
          </view>
          <view class="info-entry-content">
            <text class="info-entry-title">我的车辆</text>
            <text class="info-entry-desc">{{ carBoundDesc }}</text>
          </view>
        </view>
        <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
      </view>

      <!-- 功能列表 -->
      <view class="menu-card">
        <view class="menu-item" @click="toGuide">
          <view class="menu-icon" style="background: #ecfdf5">
            <yy-icon name="ri:book-open-line" size="20" color="#10b981" />
          </view>
          <view class="menu-content">
            <text class="menu-label">使用教程</text>
            <text class="menu-desc">新手指南和常见问题</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="toStatistics">
          <view class="menu-icon" style="background: #fef3c7">
            <yy-icon name="ri:bar-chart-box-line" size="20" color="#d97706" />
          </view>
          <view class="menu-content">
            <text class="menu-label">使用统计</text>
            <text class="menu-desc">查看挪车数据和使用趋势</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="toQrcode">
          <view class="menu-icon" style="background: var(--u-type-primary-light)">
            <yy-icon name="ri:qr-code-line" size="20" :color="uni.$u.color.primary" />
          </view>
          <view class="menu-content">
            <text class="menu-label">我的挪车码</text>
            <text class="menu-desc">生成专属二维码贴在车窗</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="toContactHistory">
          <view class="menu-icon" style="background: #eff6ff">
            <yy-icon name="ri:history-line" size="20" :color="uni.$u.color.primary" />
          </view>
          <view class="menu-content">
            <text class="menu-label">联系历史</text>
            <text class="menu-desc">查看我联系过的车主记录</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="shareApp">
          <view class="menu-icon" style="background: #f0fdf4">
            <yy-icon name="ri:share-forward-line" size="20" color="#16a34a" />
          </view>
          <view class="menu-content">
            <text class="menu-label">分享给朋友</text>
            <text class="menu-desc">推荐挪车助手给好友</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="showThemePicker">
          <view class="menu-icon" :style="{ background: uni.$u.color.primaryLight }">
            <yy-icon name="ri:palette-line" size="20" :color="uni.$u.color.primary" />
          </view>
          <view class="menu-content">
            <text class="menu-label">主题设置</text>
            <text class="menu-desc">切换应用主题色</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="toFeedback">
          <view class="menu-icon" style="background: #fef3c7">
            <yy-icon name="ri:feedback-line" size="20" color="#d97706" />
          </view>
          <view class="menu-content">
            <text class="menu-label">用户反馈</text>
            <text class="menu-desc">意见建议、问题反馈</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>

        <view class="menu-item" @click="showAbout">
          <view class="menu-icon" style="background: #faf5ff">
            <yy-icon name="ri:information-line" size="20" color="#9333ea" />
          </view>
          <view class="menu-content">
            <text class="menu-label">关于我们</text>
            <text class="menu-desc">v1.0.0</text>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>
      </view>

      <!-- 注销账号 -->
      <view class="logout-card" @click="handleLogout">
        <yy-icon name="ri:logout-box-r-line" size="18" color="#ef4444" />
        <text class="logout-text">注销账号</text>
      </view>

      <view style="height: 40rpx"></view>
    </view>

    <!-- 主题选择弹框 -->
    <yy-theme-picker v-model="themePickerVisible" />
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
    navTitle: '我的',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const themePickerVisible = ref(false)
  const carPlateDesc = ref('')

  const carBoundDesc = computed(() => carPlateDesc.value || '点击添加或管理车牌信息')

  const profileSectionStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary} 0%, ${uni.$u.color.primary} 60%, ${uni.$u.color.primary} 100%)`,
  }))

  const avatarWrapStyle = computed(() => ({
    boxShadow: `0 8px 24px ${uni.$u.color.primary}40`,
  }))

  const avatarStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primaryDisabled}, ${uni.$u.color.primary})`,
  }))

  onLoad(() => {
    loadCarDesc()
  })

  onShow(() => {
    loadCarDesc()
  })

  onShareAppMessage(() => {
    return {
      title: '扫码挪车 - 便捷联系车主',
      path: '/pages/index/index',
      imageUrl: '/static/logo.png',
    }
  })

  onShareTimeline(() => {
    return {
      title: '扫码挪车 - 便捷联系车主',
      path: '/pages/index/index',
      imageUrl: '/static/logo.png',
    }
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  // 加载车辆简要信息（用于入口描述展示）
  async function loadCarDesc() {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      carPlateDesc.value = ''
      return
    }
    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.getMyCarList',
        data: { uid },
        needAlert: false,
      })
      if (res.code === 0 && res.data && res.data.carList && res.data.carList.length > 0) {
        const list = res.data.carList
        const defaultCar = list.find(c => c.isDefault) || list[0]
        if (defaultCar && defaultCar.plate) {
          vk.setStorageSync('my_car_plate', defaultCar.plate)
        }
        const plates = list.map(c => c.plate).filter(Boolean)
        carPlateDesc.value =
          plates.length > 0
            ? `已绑定 ${plates.length} 辆车：${plates.slice(0, 2).join('、')}${plates.length > 2 ? '...' : ''}`
            : ''
      } else {
        carPlateDesc.value = ''
      }
    } catch (err) {
      carPlateDesc.value = ''
    }
  }

  function toCarManage() {
    vk.navigateTo('/pages/my/car-manage')
  }

  function toGuide() {
    vk.navigateTo('/pages/my/guide')
  }

  function toStatistics() {
    vk.navigateTo('/pages/my/statistics')
  }

  function toQrcode() {
    vk.navigateTo('/pages/my/qrcode')
  }

  function toContactHistory() {
    vk.navigateTo('/pages/my/contact-history')
  }

  function shareApp() {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
    vk.toast('请点击右上角分享')
  }

  function toFeedback() {
    vk.navigateTo('/pages/my/feedback')
  }

  function showAbout() {
    vk.alert(
      '一款便捷的挪车工具，帮助您快速联系车主或被联系，让出行更高效。\n\n版本：v1.0.0   \n\n作者微信：YovoeL--0326',
      '关于挪车助手',
      '我知道了',
    )
  }

  function showThemePicker() {
    themePickerVisible.value = true
  }

  function handleLogout() {
    vk.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定退出',
      cancelText: '取消',
      success: async res => {
        if (res.confirm) {
          try {
            await new Promise((resolve, reject) => {
              vk.userCenter.logout({
                success: () => resolve(),
                fail: err => reject(err),
              })
            })

            vk.removeStorageSync('uni_id_token')
            vk.removeStorageSync('uni_id_token_expired')
            vk.removeStorageSync('my_car_plate')

            carPlateDesc.value = ''
            vk.toast('已退出登录')
            vk.redirectTo('/pages/index/index')
          } catch (err) {
            vk.toast('退出失败')
          }
        }
      },
    })
  }
</script>

<style lang="scss" scoped>
  .page-content {
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* 用户头像区 */
  .profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 24px;
  }

  .avatar-wrap {
    width: 88px;
    height: 88px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    padding: 4px;
  }

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-name {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
  }

  .profile-plate {
    margin-top: 4px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 1px;
  }

  /* 车辆入口卡片 */
  .info-entry-card {
    margin: 16px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    &:active {
      background: #f9fafb;
    }
  }

  .info-entry-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    background: var(--u-type-primary-light);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .info-entry-content {
    flex: 1;
  }

  .info-entry-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .info-entry-desc {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.4;
  }

  /* 菜单卡片 */
  .menu-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f9fafb;
    }
  }

  .menu-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-content {
    flex: 1;
  }

  .menu-label {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .menu-desc {
    display: block;
    font-size: 12px;
    color: #9ca3af;
  }

  /* 注销账号 */
  .logout-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    &:active {
      opacity: 0.8;
      background: #fef2f2;
    }
  }

  .logout-text {
    font-size: 14px;
    font-weight: 500;
    color: #ef4444;
  }
</style>
