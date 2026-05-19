<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 顶部标题区 -->
      <view class="guide-header-section">
        <view class="guide-header-icon" :style="{ background: uni.$u.color.primaryLight }">
          <yy-icon name="ri:book-open-line" size="28" :color="uni.$u.color.primary" />
        </view>
        <text class="guide-header-title">新手指南</text>
        <text class="guide-header-subtitle">三步上手，轻松使用挪车助手</text>
      </view>

      <!-- 步骤列表 -->
      <view class="step-list">
        <view v-for="(step, index) in guideSteps" :key="index" class="step-card">
          <view class="step-num-row">
            <view class="step-num" :style="{ background: uni.$u.color.primary }">
              <text class="step-num-text">{{ index + 1 }}</text>
            </view>
            <view v-if="index < guideSteps.length - 1" class="step-line" :style="{ background: uni.$u.color.primary }"></view>
          </view>
          <view class="step-content">
            <view class="step-title-row">
              <yy-icon :name="step.icon" size="18" :color="uni.$u.color.primary" />
              <text class="step-title">{{ step.title }}</text>
            </view>
            <text class="step-desc">{{ step.desc }}</text>
            <view class="step-tips">
              <view v-for="(tip, tIdx) in step.tips" :key="tIdx" class="step-tip-item">
                <view class="step-tip-dot" :style="{ background: uni.$u.color.primary }"></view>
                <text class="step-tip-text">{{ tip }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 常见问题 -->
      <view class="faq-card">
        <view class="faq-header">
          <yy-icon name="ri:question-answer-line" size="18" :color="uni.$u.color.primary" />
          <text class="faq-title">常见问题</text>
        </view>
        <view class="faq-list">
          <view v-for="(item, index) in faqList" :key="index" class="faq-item" @click="toggleFaq(index)">
            <view class="faq-question">
              <text class="faq-q-text">{{ item.question }}</text>
              <yy-icon :name="item.expanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" size="18" color="#9ca3af" />
            </view>
            <view v-if="item.expanded" class="faq-answer">
              <text class="faq-a-text">{{ item.answer }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷操作入口 -->
      <view class="quick-actions">
        <text class="quick-actions-title">快速开始</text>
        <view class="quick-actions-row">
          <view class="quick-action-btn" :style="quickActionStyle" @click="toCarManage">
            <yy-icon name="ri:car-line" size="20" color="#ffffff" />
            <text class="quick-action-text">添加车辆</text>
          </view>
          <view class="quick-action-btn" :style="quickActionStyle2" @click="toIndex">
            <yy-icon name="ri:search-line" size="20" color="#ffffff" />
            <text class="quick-action-text">查找车主</text>
          </view>
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
    navTitle: '使用教程',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 教程内容 ======
  const guideSteps = [
    {
      icon: 'ri:car-line',
      title: '添加我的车辆',
      desc: '在"我的车辆"中填写车牌号和联系电话，生成您的专属挪车码。',
      tips: ['支持绑定多辆车（最多5辆）', '可设置默认车辆和车辆描述', '副号和联系说明为可选项'],
    },
    {
      icon: 'ri:qr-code-line',
      title: '生成挪车码',
      desc: '保存挪车海报并打印，贴在车窗明显位置，他人扫码即可联系您。',
      tips: ['海报包含微信小程序码', '扫码后直接拨打车主电话', '支持隐藏真实手机号保护隐私'],
    },
    {
      icon: 'ri:phone-line',
      title: '联系其他车主',
      desc: '在首页输入车牌号或扫描挪车码，快速联系需要挪车的车主。',
      tips: ['支持手动输入车牌号查询', '支持扫描车窗上的挪车码', '未注册车辆可拨打114查询'],
    },
  ]

  const faqList = ref([
    {
      question: '我的个人信息会被泄露吗？',
      answer: '不会。您可以选择"隐藏真实手机号"，他人只能通过小程序联系您，不会看到您的真实号码。所有数据均经过加密存储。',
      expanded: false,
    },
    {
      question: '可以绑定多辆车吗？',
      answer: '可以，每个账号最多可绑定5辆车。您可以设置其中一辆为默认车辆，也可以在生成挪车码时切换不同车辆。',
      expanded: false,
    },
    {
      question: '挪车码如何打印？',
      answer: '在"我的挪车码"页面点击"保存海报到相册"，然后将图片发送到打印店打印成10x10cm的贴纸，或自行用A4纸打印裁剪。',
      expanded: false,
    },
    {
      question: '如何接收挪车通知？',
      answer: '在"我的车辆"页面开启"接收挪车通知"，并配置pushplus推送通道。当他人联系您时，您将收到微信推送通知。',
      expanded: false,
    },
    {
      question: '联系历史可以删除吗？',
      answer: '可以。在"联系历史"页面，您可以左滑删除单条记录，或点击右上角清空全部记录。',
      expanded: false,
    },
  ])

  const quickActionStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
    boxShadow: `0 6px 16px ${uni.$u.color.primary}4d`,
  }))

  const quickActionStyle2 = computed(() => ({
    background: 'linear-gradient(135deg, #10b981, #059669)',
    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)',
  }))

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([])
  }

  function toggleFaq(index) {
    faqList.value[index].expanded = !faqList.value[index].expanded
  }

  function toCarManage() {
    vk.navigateTo('/pages/my/car-manage')
  }

  function toIndex() {
    vk.switchTab('/pages/index/index')
  }
</script>

<style lang="scss" scoped>
  .page-content {
    min-height: 100vh;
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* 顶部标题区 */
  .guide-header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
  }

  .guide-header-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .guide-header-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .guide-header-subtitle {
    font-size: 13px;
    color: #9ca3af;
  }

  /* 步骤列表 */
  .step-list {
    margin: 0 16px;
  }

  .step-card {
    display: flex;
    gap: 14px;
    margin-bottom: 8px;
  }

  .step-num-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-num-text {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
  }

  .step-line {
    width: 2px;
    flex: 1;
    min-height: 40px;
    margin: 4px 0;
    opacity: 0.3;
  }

  .step-content {
    flex: 1;
    background: #ffffff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .step-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .step-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .step-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 10px;
    display: block;
  }

  .step-tips {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .step-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .step-tip-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .step-tip-text {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }

  /* FAQ卡片 */
  .faq-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .faq-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .faq-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
  }

  .faq-item {
    border-bottom: 1px solid #f3f4f6;
    padding: 12px 0;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }
  }

  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .faq-q-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    flex: 1;
  }

  .faq-answer {
    margin-top: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    border-radius: 10px;
  }

  .faq-a-text {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  }

  /* 快捷操作 */
  .quick-actions {
    margin: 12px 16px 0;
  }

  .quick-actions-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 10px;
    padding-left: 4px;
  }

  .quick-actions-row {
    display: flex;
    gap: 10px;
  }

  .quick-action-btn {
    flex: 1;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  .quick-action-text {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
</style>
