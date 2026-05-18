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
        <text class="nav-title-text">我的挪车码</text>
        <view class="nav-back" style="opacity: 0;"></view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ paddingTop: (safeAreaTop + 56) + 'px' }">
      <!-- 二维码展示卡 -->
      <view class="qr-card" v-if="hasInfo">
        <!-- 车牌信息头部 -->
        <view class="qr-card-header">
          <view class="qr-car-icon">
            <yy-icon name="ri:car-line" size="28" color="#2563eb" />
          </view>
          <view class="qr-car-info">
            <text class="qr-plate">{{ carInfo.plate }}</text>
            <text class="qr-desc" v-if="carInfo.carDesc">{{ carInfo.carDesc }}</text>
          </view>
        </view>

        <!-- 二维码区域 -->
        <view class="qr-code-area">
          <view class="qr-border">
            <canvas
              canvas-id="qrCanvas"
              id="qrCanvas"
              class="qr-canvas"
              :style="{ width: '200px', height: '200px' }"
            ></canvas>
            <!-- 中心 logo -->
            <view class="qr-center-icon">
              <yy-icon name="ri:car-fill" size="18" color="#2563eb" />
            </view>
          </view>
          <text class="qr-scan-tip">扫描此码即可联系车主</text>
        </view>

        <!-- 信息摘要 -->
        <view class="qr-info-list">
          <view class="qr-info-item">
            <yy-icon name="ri:phone-line" size="16" color="#6b7280" />
            <text class="qr-info-value">{{ displayPhone }}</text>
          </view>
          <view class="qr-info-item" v-if="carInfo.note">
            <yy-icon name="ri:message-2-line" size="16" color="#6b7280" />
            <text class="qr-info-value">{{ carInfo.note }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="qr-actions">
          <view class="qr-btn-save" @click="saveQRCode">
            <yy-icon name="ri:download-line" size="18" color="#ffffff" />
            <text class="qr-btn-save-text">保存到相册</text>
          </view>
          <view class="qr-btn-share" @click="shareQR">
            <yy-icon name="ri:share-line" size="18" color="#2563eb" />
            <text class="qr-btn-share-text">分享</text>
          </view>
        </view>
      </view>

      <!-- 未设置信息 -->
      <view class="empty-card" v-else>
        <view class="empty-icon">
          <yy-icon name="ri:qr-code-line" size="56" color="#d1d5db" />
        </view>
        <text class="empty-title">暂无挪车码</text>
        <text class="empty-desc">请先在"我的"页面设置车辆信息后再生成挪车码</text>
        <view class="empty-btn" @click="toMy">
          <text class="empty-btn-text">去设置车辆信息</text>
        </view>
      </view>

      <!-- 使用说明 -->
      <view class="guide-card" v-if="hasInfo">
        <view class="guide-header">
          <yy-icon name="ri:question-line" size="16" color="#2563eb" />
          <text class="guide-title">如何使用挪车码？</text>
        </view>
        <view class="guide-steps">
          <view class="guide-step">
            <view class="step-num">1</view>
            <view class="step-content">
              <text class="step-title">保存或打印</text>
              <text class="step-desc">点击"保存到相册"，在打印店打印为贴纸</text>
            </view>
          </view>
          <view class="guide-step">
            <view class="step-num">2</view>
            <view class="step-content">
              <text class="step-title">贴在车窗上</text>
              <text class="step-desc">将二维码贴在挡风玻璃内侧或车窗明显位置</text>
            </view>
          </view>
          <view class="guide-step">
            <view class="step-num">3</view>
            <view class="step-content">
              <text class="step-title">等待扫码联系</text>
              <text class="step-desc">他人扫码后可直接拨打您的电话或发送短信</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 40px;"></view>
    </scroll-view>
  </view>
</template>

<script setup>
  const safeAreaTop = ref(0)
  const carInfo = ref({
    plate: '',
    phone: '',
    carDesc: '',
    note: '',
    hidePhone: false,
  })
  const hasInfo = ref(false)

  const displayPhone = computed(() => {
    if (!carInfo.value.phone) return ''
    return carInfo.value.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  })

  onLoad(() => {
    const sysInfo = uni.getSystemInfoSync()
    safeAreaTop.value = sysInfo.statusBarHeight || 0

    const saved = uni.getStorageSync('my_car_info')
    if (saved && saved.plate && saved.phone) {
      carInfo.value = saved
      hasInfo.value = true

      // 等视图渲染后画二维码
      setTimeout(() => {
        drawQRCode()
      }, 300)
    }
  })

  function drawQRCode() {
    const qrData = JSON.stringify({
      plate: carInfo.value.plate,
      phone: carInfo.value.phone,
      note: carInfo.value.note || '',
      t: Date.now(),
    })

    // 简易二维码生成（使用 canvas 画一个占位的二维码样式）
    // 实际项目建议引入 weapp-qrcode 或 uQRCode 库
    const ctx = uni.createCanvasContext('qrCanvas')
    const size = 200
    const cellSize = size / 25

    // 画背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, size, size)

    // 用简单的hash模式模拟二维码外观
    const dataStr = qrData
    ctx.setFillStyle('#1f2937')

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // 定位标记（左上、右上、左下）
        if (isPositionMarker(row, col, 25)) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
          continue
        }
        // 数据区域：使用字符串hash模拟
        const idx = row * 25 + col
        const charCode = dataStr.charCodeAt(idx % dataStr.length)
        if ((charCode + idx) % 3 !== 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }

    ctx.draw()
  }

  function isPositionMarker(row, col, size) {
    // 左上 7x7
    if (row < 7 && col < 7) {
      if (row === 0 || row === 6 || col === 0 || col === 6) return true
      if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true
      return false
    }
    // 右上 7x7
    if (row < 7 && col >= size - 7) {
      const c = col - (size - 7)
      if (row === 0 || row === 6 || c === 0 || c === 6) return true
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true
      return false
    }
    // 左下 7x7
    if (row >= size - 7 && col < 7) {
      const r = row - (size - 7)
      if (r === 0 || r === 6 || col === 0 || col === 6) return true
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true
      return false
    }
    return false
  }

  function saveQRCode() {
    uni.canvasToTempFilePath({
      canvasId: 'qrCanvas',
      success: res => {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败，请检查权限', icon: 'none' })
          },
        })
      },
      fail: () => {
        uni.showToast({ title: '生成图片失败', icon: 'none' })
      },
    })
  }

  function shareQR() {
    uni.showToast({ title: '请使用右上角分享', icon: 'none' })
  }

  function toMy() {
    uni.navigateTo({ url: '/pages/my/index' })
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

  /* 二维码卡片 */
  .qr-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 24px;
    padding: 24px 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    position: relative;
    z-index: 10;
  }

  .qr-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e5e7eb;
  }

  .qr-car-icon {
    width: 52px;
    height: 52px;
    background: #eff6ff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-plate {
    display: block;
    font-size: 22px;
    font-weight: 800;
    color: #1f2937;
    letter-spacing: 1px;
  }

  .qr-desc {
    display: block;
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }

  .qr-code-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  .qr-border {
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    background: #ffffff;
    position: relative;
  }

  .qr-canvas {
    display: block;
  }

  .qr-center-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    background: #ffffff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .qr-scan-tip {
    margin-top: 14px;
    font-size: 13px;
    color: #6b7280;
  }

  .qr-info-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    background: #f9fafb;
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .qr-info-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .qr-info-value {
    font-size: 13px;
    color: #4b5563;
  }

  .qr-actions {
    display: flex;
    gap: 10px;
  }

  .qr-btn-save {
    flex: 2;
    height: 48px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    &:active { opacity: 0.9; }
  }

  .qr-btn-save-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .qr-btn-share {
    flex: 1;
    height: 48px;
    background: #eff6ff;
    border-radius: 14px;
    border: 1.5px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    &:active { opacity: 0.8; }
  }

  .qr-btn-share-text {
    font-size: 14px;
    font-weight: 600;
    color: #2563eb;
  }

  /* 空状态 */
  .empty-card {
    margin: 60px 16px 0;
    background: #ffffff;
    border-radius: 24px;
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .empty-icon {
    margin-bottom: 20px;
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
    margin-bottom: 24px;
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

  /* 使用指南 */
  .guide-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .guide-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .guide-title {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }

  .guide-steps {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .guide-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .step-num {
    width: 24px;
    height: 24px;
    background: #eff6ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #2563eb;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
  }

  .step-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .step-desc {
    display: block;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }
</style>
