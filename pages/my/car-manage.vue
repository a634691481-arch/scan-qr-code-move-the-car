<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 车辆信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <view class="card-title-row">
            <view class="card-icon">
              <yy-icon name="ri:car-line" size="20" :color="uni.$u.color.primary" />
            </view>
            <text class="card-title">我的车辆</text>
          </view>
          <text v-if="carList.length > 0" class="card-status">
            <view class="">已绑定 {{ carList.length }} 辆</view>
          </text>
        </view>

        <!-- 车辆列表 -->
        <view v-for="(car, index) in carList" :key="car._id || car.tempId" class="car-item">
          <view class="car-item-header">
            <text class="car-item-title">车辆 {{ index + 1 }}</text>
            <view class="car-item-actions">
              <text v-if="car.isDefault" class="car-default-badge">默认</text>
              <text v-else class="car-set-default" @click="setDefault(index)">设为默认</text>
              <view class="car-delete-btn" @click="removeCar(index)">
                <yy-icon name="ri:delete-bin-line" size="14" color="#ef4444" />
              </view>
            </view>
          </view>

          <!-- 车牌号 -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-text">车牌号码</text>
              <text class="label-required">*</text>
            </view>
            <view class="plate-input-row" @click="showPlateKeyboard(index)">
              <template v-for="(char, idx) in getPlateChars(car.plate)" :key="idx">
                <view v-if="idx === 2" class="plate-separator-dot"></view>
                <view
                  class="plate-cell"
                  :class="{
                    'plate-cell-filled': char,
                    'plate-cell-province': idx === 0,
                  }"
                >
                  <text class="plate-cell-text">{{ char || '' }}</text>
                </view>
              </template>
            </view>
          </view>

          <!-- 车型/颜色（可选） -->
          <view class="form-item">
            <view class="form-label">
              <text class="label-text">车辆描述</text>
              <text class="label-tip">（可选）</text>
            </view>
            <input
              v-model="car.carDesc"
              class="form-input"
              placeholder="例如：白色丰田凯美瑞"
              placeholder-class="form-placeholder"
              maxlength="20"
            />
          </view>
        </view>

        <!-- 添加车辆按钮 -->
        <view v-if="carList.length < 5" class="add-car-btn" @click="addCar">
          <yy-icon name="ri:add-line" size="18" :color="uni.$u.color.primary" />
          <text class="add-car-text">添加车辆</text>
        </view>
        <text v-else class="add-car-limit">最多可绑定 5 辆车</text>

        <view class="privacy-divider"></view>

        <!-- 联系电话 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">联系电话</text>
            <text class="label-required">*</text>
          </view>
          <input
            v-model="form.phone"
            class="form-input"
            placeholder="请输入手机号"
            placeholder-class="form-placeholder"
            type="number"
            maxlength="11"
          />
        </view>

        <!-- 副号 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">副号</text>
            <text class="label-tip">（可选）</text>
          </view>
          <input
            v-model="form.subPhone"
            class="form-input"
            placeholder="请输入备用手机号"
            placeholder-class="form-placeholder"
            type="number"
            maxlength="11"
          />
        </view>

        <!-- 联系说明 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">联系说明</text>
            <text class="label-tip">（可选）</text>
          </view>
          <textarea
            v-model="form.note"
            class="form-textarea"
            placeholder="例如：开会中不便接电话，稍后会回电"
            placeholder-class="form-placeholder"
            maxlength="80"
            :show-confirm-bar="false"
            auto-height
          />
          <text class="char-count">{{ form.note.length }}/80</text>

          <!-- 快捷话术 -->
          <view class="quick-phrases">
            <text class="quick-phrases-label">快捷话术：</text>
            <view class="phrase-tags">
              <text v-for="phrase in quickPhrases" :key="phrase" class="phrase-tag" @click="fillPhrase(phrase)">
                {{ phrase }}
              </text>
            </view>
          </view>
        </view>

        <view class="privacy-divider"></view>

        <view class="setting-inline">
          <view class="setting-inline-info">
            <text class="setting-inline-label">隐藏真实手机号</text>
            <text class="setting-inline-desc">他人扫码后仅能通过小程序联系，不显示真实号码</text>
          </view>
          <u-switch v-model="form.hidePhone" :activeColor="uni.$u.color.primary" size="34" />
        </view>

        <view class="setting-inline">
          <view class="setting-inline-info">
            <text class="setting-inline-label">接收挪车通知</text>
            <text class="setting-inline-desc">他人扫码或搜索您的车辆时推送通知</text>
          </view>
          <u-switch v-model="form.receiveNotify" :activeColor="uni.$u.color.primary" size="34" />
        </view>

        <!-- pushplus token 设置（折叠面板） -->
        <view v-if="form.receiveNotify" class="token-collapse">
          <view class="token-collapse-header" @click="tokenExpanded = !tokenExpanded">
            <view class="token-collapse-left">
              <yy-icon name="ri:notification-3-line" size="14" :color="uni.$u.color.primary" />
              <text class="token-collapse-title">推送通道配置</text>
            </view>
            <yy-icon :name="tokenExpanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" size="18" color="#9ca3af" />
          </view>
          <view v-if="tokenExpanded" class="token-collapse-body">
            <view class="token-qrcode-wrap">
              <image class="token-qrcode" src="/static/pushplus-qrcode.png" mode="aspectFit" show-menu-by-longpress />
              <text class="token-qrcode-tip">长按识别关注公众号</text>
            </view>
            <view class="token-steps">
              <text class="token-step">1. 关注公众号"pushplus推送加"</text>
              <text class="token-step">2. 在公众号中发送消息"token"</text>
              <text class="token-step">3. 复制返回的消息token</text>
              <text class="token-step">4. 将公众号设置为免打扰</text>
              <text class="token-step">5. 将token粘贴到下方输入框</text>
            </view>
            <input
              v-model="form.pushToken"
              class="token-input"
              placeholder="请输入pushplus token"
              placeholder-class="token-placeholder"
              maxlength="64"
            />
          </view>
        </view>

        <!-- 挪车码入口 -->
        <view class="qrcode-card" @click="toQrcode">
          <view class="qrcode-left">
            <view class="qrcode-icon" :style="{ background: uni.$u.color.primaryLight }">
              <yy-icon name="ri:qr-code-line" size="24" :color="uni.$u.color.primary" />
            </view>
            <view class="qrcode-info">
              <text class="qrcode-title">我的挪车码</text>
              <text class="qrcode-desc">生成专属二维码海报，保存后打印贴在车窗</text>
            </view>
          </view>
          <yy-icon name="ri:arrow-right-s-line" size="20" color="#9ca3af" />
        </view>
      </view>
    </view>

    <!-- 车牌输入键盘组件 -->
    <yy-plate-keyboard v-model:visible="keyboardVisible" v-model="editingPlate" @change="onPlateChange" />

    <!-- 底部固定保存按钮 -->
    <template #bottom>
      <yy-fixed-bottom
        text="保存车辆信息"
        icon="ri:save-line"
        :disabled="!canSave"
        :btn-style="saveBtnStyle"
        @click="saveInfo"
      />
    </template>
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
    navTitle: '车辆管理',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const keyboardVisible = ref(false)
  const tokenExpanded = ref(true)
  const editingCarIndex = ref(-1)
  const editingPlate = ref('')

  const defaultNote = '您好，我的车临时停在此处，如有妨碍请随时联系我，谢谢！'

  const quickPhrases = [
    '您好，我的车临时停在此处，如有妨碍请随时联系我，谢谢！',
    '抱歉打扰，车辆临时停靠，马上回来挪车。',
    '正在附近办事，5分钟内回来，请稍等。',
    '车辆故障，已联系拖车，请谅解。',
    '紧急停车，如有妨碍请电话联系，马上处理。',
  ]

  // 车辆列表（多辆车）
  const carList = ref([])

  // 用户联系信息（所有车辆共享）
  const form = ref({
    phone: '',
    subPhone: '',
    note: defaultNote,
    ownerName: '',
    hidePhone: false,
    receiveNotify: true,
    pushToken: '',
  })

  const hasSaved = computed(() => carList.value.length > 0 && carList.value.some(c => c.plate && c.plate.length >= 7))

  const canSave = computed(() => {
    const hasValidCar = carList.value.some(car => car.plate && car.plate.length >= 7)
    return hasValidCar && /^1[3-9]\d{9}$/.test(form.value.phone)
  })

  const saveBtnStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
    boxShadow: `0 6px 16px ${uni.$u.color.primary}4d`,
  }))

  onLoad(() => {
    loadInfo()
  })

  onShow(() => {
    loadInfo()
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  function getPlateChars(plate) {
    const chars = (plate || '').split('')
    while (chars.length < 8) chars.push('')
    return chars
  }

  function generateTempId() {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  function addCar() {
    if (carList.value.length >= 5) {
      vk.toast('最多可绑定 5 辆车')
      return
    }
    carList.value.push({
      _id: '',
      tempId: generateTempId(),
      plate: '',
      carDesc: '',
      isDefault: carList.value.length === 0,
    })
  }

  function removeCar(index) {
    vk.confirm({
      title: '删除车辆',
      content: `确定要删除这辆车${carList.value[index].plate ? '（' + carList.value[index].plate + '）' : ''}吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          const removed = carList.value.splice(index, 1)[0]
          if (removed.isDefault && carList.value.length > 0) {
            carList.value[0].isDefault = true
          }
        }
      },
    })
  }

  function setDefault(index) {
    carList.value.forEach((car, i) => {
      car.isDefault = i === index
    })
  }

  function showPlateKeyboard(index) {
    editingCarIndex.value = index
    editingPlate.value = carList.value[index].plate || ''
    keyboardVisible.value = true
  }

  function onPlateChange(newPlate) {
    if (editingCarIndex.value >= 0 && editingCarIndex.value < carList.value.length) {
      carList.value[editingCarIndex.value].plate = newPlate
    }
  }

  async function loadInfo() {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      carList.value = []
      return
    }
    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.getMyCarList',
        data: { uid },
        needAlert: false,
      })

      if (res.code === 0 && res.data) {
        if (res.data.carList && res.data.carList.length > 0) {
          carList.value = res.data.carList.map(car => ({
            _id: car._id || '',
            tempId: '',
            plate: car.plate || '',
            carDesc: car.carDesc || '',
            isDefault: car.isDefault || false,
          }))
        } else {
          carList.value = []
        }

        form.value = {
          phone: res.data.phone || '',
          subPhone: res.data.subPhone || '',
          note: res.data.note || defaultNote,
          ownerName: res.data.ownerName || '',
          hidePhone: res.data.hidePhone || false,
          receiveNotify: res.data.receiveNotify !== false,
          pushToken: res.data.pushToken || '',
        }

        const defaultCar = carList.value.find(c => c.isDefault) || carList.value[0]
        if (defaultCar && defaultCar.plate) {
          vk.setStorageSync('my_car_plate', defaultCar.plate)
        }
      } else {
        carList.value = []
      }
    } catch (err) {
      carList.value = []
    }
  }

  async function saveInfo() {
    if (!canSave.value) {
      if (!carList.value.some(car => car.plate && car.plate.length >= 7)) {
        vk.toast('请至少输入一辆车的完整车牌号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
        vk.toast('请输入正确的手机号')
        return
      }
    }

    for (let i = 0; i < carList.value.length; i++) {
      const car = carList.value[i]
      if (car.plate && car.plate.length > 0 && car.plate.length < 7) {
        vk.toast(`车辆 ${i + 1} 的车牌号不完整`)
        return
      }
    }

    const plates = carList.value.filter(car => car.plate).map(car => car.plate.toUpperCase())
    const uniquePlates = [...new Set(plates)]
    if (plates.length !== uniquePlates.length) {
      vk.toast('车牌号不能重复')
      return
    }

    vk.showLoading({ title: '保存中...', mask: true })

    try {
      const uid = vk.getStorageSync('uni_id_token')
      if (!uid) {
        vk.hideLoading()
        vk.toast('请先登录')
        return
      }

      const res = await vk.callFunction({
        url: 'client/pub_index.saveCarList',
        data: {
          uid,
          carList: carList.value.map(car => ({
            _id: car._id || undefined,
            plate: car.plate,
            carDesc: car.carDesc,
            isDefault: car.isDefault,
          })),
          phone: form.value.phone,
          subPhone: form.value.subPhone,
          note: form.value.note,
          ownerName: form.value.ownerName,
          hidePhone: form.value.hidePhone,
          receiveNotify: form.value.receiveNotify,
          pushToken: form.value.pushToken,
        },
        needAlert: false,
      })

      vk.hideLoading()

      if (res.code === 0) {
        if (res.data && res.data.carIds) {
          res.data.carIds.forEach((id, idx) => {
            if (carList.value[idx]) {
              carList.value[idx]._id = id
              carList.value[idx].tempId = ''
            }
          })
        }
        const defaultCar = carList.value.find(c => c.isDefault) || carList.value[0]
        if (defaultCar && defaultCar.plate) {
          vk.setStorageSync('my_car_plate', defaultCar.plate)
        }
        vk.toast(res.msg || '保存成功')
      } else {
        vk.toast(res.msg || '保存失败')
      }
    } catch (err) {
      console.log('err==> ', err)
      vk.hideLoading()
      vk.toast(err.msg || '保存失败')
    }
  }

  function toQrcode() {
    if (!hasSaved.value) {
      vk.toast('请先保存车辆信息')
      return
    }
    vk.navigateTo('/pages/my/qrcode')
  }

  function fillPhrase(phrase) {
    form.value.note = phrase
  }
</script>

<style lang="scss" scoped>
  .page-content {
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* 信息卡片 */
  .info-card {
    margin: 16px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-icon {
    width: 32px;
    height: 32px;
    background: var(--u-type-primary-light);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .card-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #16a34a;
  }

  /* 车辆条目 */
  .car-item {
    background: #f9fafb;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
  }

  .car-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .car-item-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .car-item-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .car-default-badge {
    font-size: 11px;
    color: var(--u-type-primary);
    background: var(--u-type-primary-light);
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid var(--u-type-primary-disabled);
  }

  .car-set-default {
    font-size: 11px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 500;

    &:active {
      opacity: 0.7;
    }
  }

  .car-delete-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;

    &:active {
      background: #fee2e2;
    }
  }

  /* 添加车辆按钮 */
  .add-car-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 44px;
    border-radius: 12px;
    border: 1.5px dashed var(--u-type-primary);
    margin-bottom: 12px;

    &:active {
      background: var(--u-type-primary-light);
    }
  }

  .add-car-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--u-type-primary);
  }

  .add-car-limit {
    display: block;
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 12px;
  }

  /* 表单 */
  .form-item {
    margin-bottom: 16px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
  }

  .label-text {
    font-size: 13px;
    color: #4b5563;
    font-weight: 500;
  }

  .label-required {
    font-size: 13px;
    color: #ef4444;
  }

  .label-tip {
    font-size: 11px;
    color: #9ca3af;
  }

  .form-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    color: #111827;
    box-sizing: border-box;
  }

  .form-placeholder {
    color: #9ca3af;
    font-size: 14px;
  }

  .form-textarea {
    width: 100%;
    min-height: 64px;
    padding: 12px 14px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    color: #111827;
    box-sizing: border-box;
    line-height: 1.5;
  }

  .char-count {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 11px;
    color: #9ca3af;
  }

  /* 快捷话术 */
  .quick-phrases {
    margin-top: 10px;
  }

  .quick-phrases-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
    display: block;
  }

  .phrase-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .phrase-tag {
    font-size: 12px;
    color: var(--u-type-primary);
    background: var(--u-type-primary-light);
    padding: 5px 10px;
    border-radius: 16px;
    line-height: 1;

    &:active {
      opacity: 0.7;
    }
  }

  /* 车牌输入行 */
  .plate-input-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    justify-content: center;
  }

  .plate-cell {
    width: 36px;
    height: 44px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    position: relative;

    &.plate-cell-filled {
      border-color: var(--u-type-primary);
    }

    &.plate-cell-province {
      background: var(--u-type-primary);
      border-color: var(--u-type-primary);

      .plate-cell-text {
        color: #ffffff;
        font-weight: 700;
      }
    }
  }

  .plate-separator-dot {
    width: 7px;
    height: 7px;
    background: var(--u-type-primary);
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 2px;
  }

  .plate-cell-text {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  /* 隐私设置 */
  .privacy-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 8px 0 14px;
  }

  .setting-inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    gap: 12px;
  }

  .setting-inline + .setting-inline {
    border-top: 1px solid #f3f4f6;
  }

  .setting-inline-info {
    flex: 1;
  }

  .setting-inline-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .setting-inline-desc {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.4;
  }

  /* pushplus token 折叠面板 */
  .token-collapse {
    margin-top: 4px;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .token-collapse-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;

    &:active {
      background: #f3f4f6;
    }
  }

  .token-collapse-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .token-collapse-title {
    font-size: 13px;
    font-weight: 500;
    color: #4b5563;
  }

  .token-collapse-body {
    padding: 0 14px 14px;
  }

  .token-steps {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .token-step {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .token-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    color: #111827;
    box-sizing: border-box;
  }

  .token-placeholder {
    color: #9ca3af;
    font-size: 14px;
  }

  .token-qrcode-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 14px;
    padding: 14px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .token-qrcode {
    width: 160px;
    height: 160px;
    border-radius: 8px;
  }

  .token-qrcode-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
  }

  /* 挪车码入口卡片 */
  .qrcode-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    &:active {
      background: #f9fafb;
    }
  }

  .qrcode-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .qrcode-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .qrcode-info {
    flex: 1;
  }

  .qrcode-title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .qrcode-desc {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.4;
  }
</style>
