<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 有车辆信息 -->
      <template v-if="carList.length > 0">
        <!-- 车辆切换标签 -->
        <view v-if="carList.length > 1" class="car-tabs">
          <scroll-view scroll-x class="car-tabs-scroll" show-scrollbar="false">
            <view
              v-for="(car, index) in carList"
              :key="car._id"
              class="car-tab"
              :class="{ 'car-tab-active': currentIndex === index }"
              @click="switchCar(index)"
            >
              <text class="car-tab-text">{{ car.plate }}</text>
              <text v-if="car.isDefault" class="car-tab-badge">默认</text>
            </view>
          </scroll-view>
        </view>

        <!-- 挪车海报卡片 -->
        <view class="poster-card">
          <view class="poster-header">
            <yy-icon name="ri:shield-check-line" size="20" :color="uni.$u.color.primary" />
            <text class="poster-header-text">微信扫码 · 一键挪车</text>
          </view>

          <!-- 小程序码展示 -->
          <view class="qr-wrap">
            <image v-if="qrBase64" :src="qrBase64" mode="aspectFit" class="qr-image" show-menu-by-longpress />
            <view v-else class="qr-placeholder">
              <view class="qr-placeholder-spinner"></view>
              <text class="qr-placeholder-text">生成中...</text>
            </view>
          </view>

          <!-- 车牌号 -->
          <view class="car-plate-bar">
            <text class="car-plate-text">{{ currentCar.plate }}</text>
          </view>

          <!-- 提示文字 -->
          <view class="hint-list">
            <view class="hint-item">
              <view class="hint-dot" :style="{ background: uni.$u.color.primary }"></view>
              <text class="hint-text">扫码后直接拨打车主电话</text>
            </view>
            <view class="hint-item">
              <view class="hint-dot" :style="{ background: uni.$u.color.primary }"></view>
              <text class="hint-text">保护隐私，号码全程加密</text>
            </view>
            <view class="hint-item">
              <view class="hint-dot" :style="{ background: uni.$u.color.primary }"></view>
              <text class="hint-text">请打印后贴在车窗明显位置</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-btns">
          <view class="btn-save" :style="btnSaveStyle" @click="savePoster">
            <yy-icon name="ri:download-line" size="18" color="#ffffff" />
            <text class="btn-save-text">保存海报到相册</text>
          </view>
          <view class="btn-share" :style="btnShareStyle" @click="sharePoster">
            <yy-icon name="ri:share-line" size="18" :color="uni.$u.color.primary" />
            <text class="btn-share-text">分享</text>
          </view>
        </view>

        <!-- 使用说明 -->
        <view class="guide-card">
          <view class="guide-header">
            <yy-icon name="ri:question-line" size="16" :color="uni.$u.color.primary" />
            <text class="guide-title">如何使用挪车码？</text>
          </view>
          <view class="guide-steps">
            <view class="guide-step">
              <view class="step-num" :style="stepNumStyle">1</view>
              <view class="step-content">
                <text class="step-title">点击保存海报</text>
                <text class="step-desc">将生成的挪车海报保存到手机相册</text>
              </view>
            </view>
            <view class="guide-step">
              <view class="step-num" :style="stepNumStyle">2</view>
              <view class="step-content">
                <text class="step-title">打印并裁剪</text>
                <text class="step-desc">到打印店打印成1100x600cm贴纸，或自行裁剪</text>
              </view>
            </view>
            <view class="guide-step">
              <view class="step-num" :style="stepNumStyle">3</view>
              <view class="step-content">
                <text class="step-title">贴在车窗上</text>
                <text class="step-desc">贴在挡风玻璃内侧或车窗明显位置即可</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 未设置信息 -->
      <view class="empty-card" v-else>
        <text class="empty-title">暂无挪车码</text>
        <text class="empty-desc">请先在"我的"页面设置车辆信息后再生成挪车码</text>
        <view class="empty-btn" :style="emptyBtnStyle" @click="toMy">
          <text class="empty-btn-text">去设置车辆信息</text>
        </view>
      </view>

      <!-- 隐藏canvas用于合成海报 -->
      <canvas
        canvas-id="posterCanvas"
        id="posterCanvas"
        class="poster-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      ></canvas>

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
    navTitle: '我的挪车码',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const carList = ref([])
  const currentIndex = ref(0)
  const qrBase64 = ref('')
  const posterImagePath = ref('')

  // canvas 尺寸 (横版海报 11:6 比例，1100x600 高清)
  const canvasWidth = ref(1100)
  const canvasHeight = ref(600)

  const currentCar = computed(() => {
    return carList.value[currentIndex.value] || {}
  })

  const btnSaveStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
    boxShadow: `0 6px 16px ${uni.$u.color.primary}4d`,
  }))

  const btnShareStyle = computed(() => ({
    background: uni.$u.color.primaryLight,
    border: `1.5px solid ${uni.$u.color.primaryDisabled}`,
  }))

  const emptyBtnStyle = computed(() => ({
    background: uni.$u.color.primary,
  }))

  const stepNumStyle = computed(() => ({
    background: uni.$u.color.primaryLight,
    color: uni.$u.color.primary,
  }))

  async function loadCarInfo() {
    qrBase64.value = ''
    try {
      const uid = vk.getStorageSync('uni_id_token')
      if (!uid) {
        carList.value = []
        return
      }

      const res = await vk.callFunction({
        url: 'client/pub_index.getMyCarList',
        data: { uid },
        needAlert: false,
      })

      if (res.code === 0 && res.data && res.data.carList && res.data.carList.length > 0) {
        carList.value = res.data.carList.map((car, index) => ({
          _id: car._id,
          plate: car.plate,
          carDesc: car.carDesc || '',
          isDefault: car.isDefault || false,
          phone: res.data.phone || '',
          note: res.data.note || '',
          hidePhone: res.data.hidePhone || false,
        }))
        const defaultIdx = carList.value.findIndex(c => c.isDefault)
        currentIndex.value = defaultIdx >= 0 ? defaultIdx : 0
        // 生成小程序码
        await generateQRCode(uid)
      } else {
        carList.value = []
      }
    } catch (err) {
      carList.value = []
    }
  }

  async function generateQRCode(uid) {
    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.generateMoveCarQRCode',
        data: { uid },
        needAlert: false,
      })
      if (res.code === 0 && res.data && res.data.base64) {
        qrBase64.value = res.data.base64
      }
    } catch (err) {
      vk.toast('生成小程序码失败', 'none')
    }
  }

  function switchCar(index) {
    currentIndex.value = index
  }

  onLoad(() => {
    loadCarInfo()
  })

  onShow(() => {
    loadCarInfo()
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  function toMy() {
    vk.navigateTo('/pages/my/index')
  }

  // ====== 合成海报并保存 ======
  async function savePoster() {
    if (!qrBase64.value) {
      vk.toast('二维码生成中，请稍候')
      return
    }

    vk.showLoading({ title: '生成海报中...', mask: true })

    try {
      const tempPath = await drawPoster()
      posterImagePath.value = tempPath

      const saveRes = await uniSaveImageToPhotosAlbum(tempPath)
      vk.hideLoading()
      if (saveRes) {
        vk.alert('挪车海报已保存到相册，快去打印吧！', '保存成功', '确定')
      }
    } catch (err) {
      console.log('err==> ', err)
      vk.hideLoading()
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        vk.confirm({
          title: '需要授权',
          content: '保存图片需要相册权限，是否去设置？',
          confirmText: '去设置',
          success: res => {
            if (res.confirm) {
              uni.openSetting()
            }
          },
        })
      } else {
        vk.toast('保存失败，请重试', 'none')
      }
    }
  }

  function sharePoster() {
    if (!posterImagePath.value) {
      vk.toast('请先保存海报')
      return
    }
    vk.toast('请使用右上角分享按钮')
  }

  function uniSaveImageToPhotosAlbum(filePath) {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(true),
        fail: err => reject(err),
      })
    })
  }

  function drawPoster() {
    return new Promise((resolve, reject) => {
      const ctx = uni.createCanvasContext('posterCanvas')
      const W = canvasWidth.value
      const H = canvasHeight.value
      const primaryColor = uni.$u.color.primary || '#2563eb'

      // 1. 透明背景（不填充，便于打印贴纸）
      ctx.clearRect(0, 0, W, H)

      // 2. 四周主题色装饰边框
      const borderWidth = 14
      ctx.setFillStyle(primaryColor)
      ctx.fillRect(0, 0, W, borderWidth)
      // ctx.fillRect(0, H - borderWidth, W, borderWidth)
      // ctx.fillRect(0, 0, borderWidth, H)
      // ctx.fillRect(W - borderWidth, 0, borderWidth, H)

      // 3. 左侧二维码区域（垂直居中，透明背景+圆角裁剪）
      const qrAreaX = 50
      const qrAreaSize = 460
      const qrAreaY = (H - qrAreaSize) / 2
      const qrPadding = 36
      const qrImgSize = qrAreaSize - qrPadding * 2
      const qrImgX = qrAreaX + qrPadding
      const qrImgY = qrAreaY + qrPadding

      // 4. 绘制二维码图片（白色圆角底 + 图片）
      if (qrBase64.value) {
        const base64Data = qrBase64.value.replace(/^data:image\/\w+;base64,/, '')
        const fs = uni.getFileSystemManager()
        const filePath = `${uni.env.USER_DATA_PATH}/qrcode_temp.png`

        try {
          fs.writeFileSync(filePath, base64Data, 'base64')
          const r = 24
          const x = qrImgX, y = qrImgY, w = qrImgSize, h = qrImgSize

          // 先画白色圆角背景（微信小程序码需要白底才能识别）
          ctx.setFillStyle('#ffffff')
          ctx.beginPath()
          ctx.moveTo(x + r, y)
          ctx.arcTo(x + w, y, x + w, y + h, r)
          ctx.arcTo(x + w, y + h, x, y + h, r)
          ctx.arcTo(x, y + h, x, y, r)
          ctx.arcTo(x, y, x + w, y, r)
          ctx.closePath()
          ctx.fill()

          // 再画二维码图片（稍微内缩，露出白边形成圆角视觉效果）
          const innerPad = 8
          ctx.drawImage(
            filePath,
            x + innerPad,
            y + innerPad,
            w - innerPad * 2,
            h - innerPad * 2,
          )
        } catch (e) {
          ctx.setFillStyle('#e5e7eb')
          ctx.fillRect(qrImgX, qrImgY, qrImgSize, qrImgSize)
        }
      }

      // 5. 右侧内容区（垂直居中）
      const rightX = qrAreaX + qrAreaSize + 50
      const rightW = W - rightX - 50
      const rightCenterX = rightX + rightW / 2
      const contentCenterY = H / 2

      // 主标题
      ctx.setFillStyle('#fff')
      ctx.setFontSize(54)
      ctx.setTextAlign('center')
      ctx.fillText('微信扫码', rightCenterX, contentCenterY - 100)

      // 副标题
      ctx.setFillStyle('#fff')
      ctx.setFontSize(54)
      ctx.fillText('呼叫车主', rightCenterX, contentCenterY - 32)

      // 分隔线
      ctx.setStrokeStyle('rgba(0,0,0,0.1)')
      ctx.setLineWidth(1)
      ctx.beginPath()
      ctx.moveTo(rightX + 40, contentCenterY + 14)
      ctx.lineTo(W - 90, contentCenterY + 14)
      ctx.stroke()

      // 标签
      const tagY = contentCenterY + 48
      const tagText = '隐私通话 · 快速联系'
      const tagW = 300
      const tagH = 50
      const tagX = rightCenterX - tagW / 2
      ctx.setFillStyle(primaryColor)
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(tagX, tagY, tagW, tagH, 25)
      } else {
        ctx.rect(tagX, tagY, tagW, tagH)
      }
      ctx.fill()
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(20)
      ctx.fillText(tagText, rightCenterX, tagY + 34)

      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'posterCanvas',
            width: W,
            height: H,
            fileType: 'png',
            success: res => {
              resolve(res.tempFilePath)
            },
            fail: err => {
              reject(err)
            },
          })
        }, 300)
      })
    })
  }
</script>

<style lang="scss" scoped>
  .page-content {
    background: #f5f7fb;
    padding: 12px 0 24rpx;
  }

  /* 车辆切换标签 */
  .car-tabs {
    margin: 0 16px 12px;
  }

  .car-tabs-scroll {
    white-space: nowrap;
  }

  .car-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #ffffff;
    border-radius: 12px;
    margin-right: 8px;
    border: 1.5px solid transparent;

    &.car-tab-active {
      border-color: var(--u-type-primary);
      background: var(--u-type-primary-light);
    }

    &:active {
      opacity: 0.8;
    }
  }

  .car-tab-text {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .car-tab-badge {
    font-size: 10px;
    color: #ffffff;
    background: var(--u-type-primary);
    padding: 1px 6px;
    border-radius: 8px;
  }

  /* 海报卡片 */
  .poster-card {
    margin: 0 16px;
    background: #ffffff;
    border-radius: 24px;
    padding: 24px 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    text-align: center;
  }

  .poster-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 16px;
  }

  .poster-header-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--u-type-primary);
  }

  /* 二维码区域 */
  .qr-wrap {
    width: 220px;
    height: 220px;
    margin: 0 auto 16px;
    background: #f9fafb;
    border-radius: 16px;
    border: 2px solid var(--u-type-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .qr-image {
    width: 200px;
    height: 200px;
  }

  .qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .qr-placeholder-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--u-type-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .qr-placeholder-text {
    font-size: 13px;
    color: #9ca3af;
  }

  /* 车牌号 */
  .car-plate-bar {
    margin-bottom: 16px;
  }

  .car-plate-text {
    font-size: 22px;
    font-weight: 800;
    color: var(--u-type-primary);
    letter-spacing: 1px;
  }

  /* 提示列表 */
  .hint-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    padding: 0 20px;
  }

  .hint-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hint-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .hint-text {
    font-size: 13px;
    color: #4b5563;
  }

  /* 操作按钮 */
  .action-btns {
    display: flex;
    gap: 10px;
    margin: 16px 16px 0;
  }

  .btn-save {
    flex: 2;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:active {
      opacity: 0.9;
    }
  }

  .btn-save-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .btn-share {
    flex: 1;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &:active {
      opacity: 0.8;
    }
  }

  .btn-share-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--u-type-primary);
  }

  /* 空状态 */
  .empty-card {
    margin: 16px 16px 0;
    background: #ffffff;
    border-radius: 24px;
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
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
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.9;
    }
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
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
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

  /* loading */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 32px 0;
    gap: 16px;
  }

  .loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--u-type-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 14px;
    color: #9ca3af;
  }

  /* 隐藏canvas */
  .poster-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
    pointer-events: none;
    opacity: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
