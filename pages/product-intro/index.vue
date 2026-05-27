<template>
  <view class="intro-page">
    <!-- 顶部 Hero 区域 -->
    <view
      class="hero-section"
      :style="{ background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})` }"
    >
      <view class="hero-content">
        <view class="hero-icon-wrap" :style="{ background: 'rgba(255,255,255,0.2)' }">
          <yy-icon name="ri:car-line" size="40" color="#ffffff" />
        </view>
        <text class="hero-title">挪车助手</text>
        <text class="hero-subtitle">智能挪车 · 便捷沟通 · 隐私保护</text>
        <text class="hero-desc">全国领先的挪车服务平台，百万车主信赖之选。 扫码即联、隐私通话，让挪车不再烦恼。</text>
        <view class="hero-stats">
          <view class="hero-stat-item">
            <text class="hero-stat-num">500万+</text>
            <text class="hero-stat-label">注册用户</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-num">1000万+</text>
            <text class="hero-stat-label">成功挪车</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-num">99.9%</text>
            <text class="hero-stat-label">联系成功率</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 核心功能 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">核心功能</text>
        <text class="section-subtitle">全方位解决您的挪车需求</text>
      </view>
      <view class="feature-grid">
        <view v-for="(feature, index) in features" :key="index" class="feature-card">
          <view class="feature-icon-wrap" :style="{ background: feature.bgColor }">
            <yy-icon :name="feature.icon" size="24" :color="feature.color" />
          </view>
          <text class="feature-title">{{ feature.title }}</text>
          <text class="feature-desc">{{ feature.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 优势亮点 -->
    <view class="section" style="background: #f5f7fb">
      <view class="section-header">
        <text class="section-title">为什么选择我们</text>
        <text class="section-subtitle">更智能、更安全、更便捷</text>
      </view>
      <view class="advantage-list">
        <view v-for="(item, index) in advantages" :key="index" class="advantage-card">
          <view class="advantage-index" :style="{ background: uni.$u.color.primary }">
            <text class="advantage-index-text">{{ index + 1 }}</text>
          </view>
          <view class="advantage-content">
            <text class="advantage-title">{{ item.title }}</text>
            <text class="advantage-desc">{{ item.desc }}</text>
            <view class="advantage-items">
              <view v-for="(point, pIdx) in item.points" :key="pIdx" class="advantage-point">
                <view class="advantage-dot" :style="{ background: uni.$u.color.primary }"></view>
                <text class="advantage-point-text">{{ point }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 使用流程 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">使用流程</text>
        <text class="section-subtitle">三步轻松搞定挪车</text>
      </view>
      <view class="flow-list">
        <view v-for="(step, index) in flowSteps" :key="index" class="flow-step">
          <view class="flow-step-left">
            <view class="flow-step-num" :style="{ background: uni.$u.color.primary }">
              <text class="flow-step-num-text">{{ index + 1 }}</text>
            </view>
            <view
              v-if="index < flowSteps.length - 1"
              class="flow-step-line"
              :style="{ background: uni.$u.color.primary }"
            ></view>
          </view>
          <view class="flow-step-card">
            <view class="flow-step-header">
              <yy-icon :name="step.icon" size="20" :color="uni.$u.color.primary" />
              <text class="flow-step-title">{{ step.title }}</text>
            </view>
            <text class="flow-step-desc">{{ step.desc }}</text>
            <view class="flow-step-tags">
              <view
                v-for="(tag, tIdx) in step.tags"
                :key="tIdx"
                class="flow-step-tag"
                :style="{ background: uni.$u.color.primaryLight, color: uni.$u.color.primary }"
              >
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="section" style="background: #f5f7fb">
      <view class="section-header">
        <text class="section-title">常见问题</text>
        <text class="section-subtitle">您可能关心的问题</text>
      </view>
      <view class="faq-list">
        <view v-for="(item, index) in faqList" :key="index" class="faq-item" @click="toggleFaq(index)">
          <view class="faq-question">
            <view class="faq-q-left">
              <view class="faq-q-badge" :style="{ background: uni.$u.color.primary }">问</view>
              <text class="faq-q-text">{{ item.question }}</text>
            </view>
            <yy-icon :name="item.expanded ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" size="20" color="#9ca3af" />
          </view>
          <view v-if="item.expanded" class="faq-answer">
            <view class="faq-a-left">
              <view class="faq-a-badge" :style="{ background: uni.$u.color.primaryLight, color: uni.$u.color.primary }">
                答
              </view>
              <text class="faq-a-text">{{ item.answer }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据安全 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">数据安全保障</text>
        <text class="section-subtitle">用心守护您的每一份隐私</text>
      </view>
      <view class="security-grid">
        <view v-for="(item, index) in securityItems" :key="index" class="security-card">
          <view class="security-icon-wrap" :style="{ background: `${item.color}15`, borderColor: `${item.color}30` }">
            <yy-icon :name="item.icon" size="22" :color="item.color" />
          </view>
          <text class="security-title">{{ item.title }}</text>
          <text class="security-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view style="height: 120rpx"></view>
  </view>

  <!-- 底部进入首页按钮 -->
  <!-- <yy-fixed-bottom
    text="进入挪车助手"
    icon="ri:arrow-right-line"
    :btn-style="{ background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})` }"
    @click="goHome"
  /> -->
</template>

<script setup>
  function goHome() {
    // 获取启动参数（从中介页面传递过来的原始启动参数）
    const launchOptions = uni.getLaunchOptionsSync()
    const query = launchOptions?.query || {}
    let url = '/pages/index/index'
    if (Object.keys(query).length > 0) {
      const qs = Object.keys(query)
        .map(k => k + '=' + encodeURIComponent(query[k]))
        .join('&')
      url += '?' + qs
    }
    vk.reLaunch({ url })
  }
  // ====== 核心功能数据 ======
  const features = [
    {
      icon: 'ri:qr-code-line',
      title: '扫码挪车',
      desc: '扫描车窗上的挪车码，一键联系车主，无需输入车牌号，快速高效。',
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      icon: 'ri:search-line',
      title: '车牌查询',
      desc: '输入车牌号即可查询车主联系方式，支持全国31个省市车牌识别。',
      color: '#059669',
      bgColor: '#ecfdf5',
    },
    {
      icon: 'ri:shield-user-line',
      title: '隐私保护',
      desc: '隐藏真实手机号，通过虚拟号码通话，保护车主隐私不被泄露。',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
    },
    {
      icon: 'ri:notification-line',
      title: '实时通知',
      desc: '有人联系挪车时，通过pushplus微信推送即时通知，不错过重要提醒。',
      color: '#d97706',
      bgColor: '#fffbeb',
    },
    {
      icon: 'ri:car-line',
      title: '多车管理',
      desc: '支持绑定最多5辆车，统一管理联系人信息，家庭用车更便捷。',
      color: '#dc2626',
      bgColor: '#fef2f2',
    },
    {
      icon: 'ri:history-line',
      title: '联系记录',
      desc: '自动记录挪车联系历史，查看每日/每周/每月统计数据，一目了然。',
      color: '#0891b2',
      bgColor: '#ecfeff',
    },
  ]

  // ====== 优势亮点 ======
  const advantages = [
    {
      title: '极速响应，立竿见影',
      desc: '从扫码到联系车主，全程不超过10秒，告别等待焦虑。',
      points: ['扫码即联，无需输入任何信息', '支持一键拨号，直达车主', '7×24小时全天候服务'],
    },
    {
      title: '隐私安全，双重保障',
      desc: '采用银行级数据加密技术，严格保护用户个人信息。',
      points: ['真实手机号全程加密存储', '可选隐藏号码保护模式', '所有数据通过加密通道传输'],
    },
    {
      title: '全国覆盖，精准识别',
      desc: '支持全国所有省市自治区的车牌号识别和查询。',
      points: ['包含新能源绿牌、黄牌、蓝牌', '军车、警车、使馆车特殊标识', '港澳跨境车牌部分支持'],
    },
    {
      title: '完全免费，无任何隐藏收费',
      desc: '所有核心功能永久免费使用，无需付费即可享受完整服务。',
      points: ['扫码联系车主完全免费', '车牌查询不收取任何费用', '生成挪车码永久免费'],
    },
  ]

  // ====== 使用流程 ======
  const flowSteps = [
    {
      icon: 'ri:user-add-line',
      title: '注册账号并添加车辆',
      desc: '使用微信一键登录，添加您的车辆信息，包括车牌号、联系电话等。',
      tags: ['微信登录', '添加车辆', '设置默认'],
    },
    {
      icon: 'ri:printer-line',
      title: '生成并打印挪车码',
      desc: '在"我的挪车码"页面生成专属挪车海报，保存到相册并打印。',
      tags: ['生成海报', '保存相册', '打印张贴'],
    },
    {
      icon: 'ri:phone-line',
      title: '扫码联系，轻松挪车',
      desc: '他人扫描您的挪车码或输入车牌号，即可快速联系您挪车。',
      tags: ['扫码联系', '车牌查询', '即时通知'],
    },
  ]

  // ====== 常见问题 ======
  const faqList = ref([
    {
      question: '挪车助手是免费的吗？',
      answer:
        '是的，挪车助手所有核心功能完全免费，包括扫码联系车主、车牌查询、生成挪车码等。我们不收取任何费用，您可以放心使用。',
      expanded: false,
    },
    {
      question: '我的电话号码会被泄露吗？',
      answer:
        '不会。我们提供隐私保护功能，开启后您的真实手机号将被隐藏，对方只能通过虚拟号码与您通话，全程无法看到您的真实号码。所有数据均采用加密存储，严格保障您的隐私安全。',
      expanded: false,
    },
    {
      question: '如何生成自己的挪车码？',
      answer:
        '您需要先注册账号并添加车辆信息，然后在"我的挪车码"页面点击"生成挪车码"，系统会自动生成包含您的信息的专属小程序码海报，保存到相册后打印出来放在车窗上即可。',
      expanded: false,
    },
    {
      question: '最多可以绑定几辆车？',
      answer:
        '每个账号最多可以绑定5辆车。您可以根据需要添加多辆车的信息，并设置其中一辆为默认车辆。在生成挪车码时也可以选择不同的车辆。',
      expanded: false,
    },
    {
      question: '联系车主时有哪些方式？',
      answer:
        '目前支持两种方式：1）扫码联系——扫描车窗上的挪车码直接联系；2）车牌查询——在首页输入车牌号查询车主联系方式。如果车辆未注册本服务，系统会提示您通过其他方式联系（如拨打114）。',
      expanded: false,
    },
    {
      question: '如何接收挪车通知提醒？',
      answer:
        '在"我的车辆"页面编辑车辆信息时，开启"接收挪车通知"开关，并按照引导配置pushplus推送服务。当有人联系您挪车时，您将及时收到微信消息通知。',
      expanded: false,
    },
    {
      question: '联系历史记录可以删除吗？',
      answer:
        '可以。在"联系历史"页面，您可以通过左滑操作单条删除记录，也可以点击页面右上角的"清空"按钮一键清空所有联系记录。',
      expanded: false,
    },
  ])

  // ====== 数据安全 ======
  const securityItems = [
    {
      icon: 'ri:lock-line',
      title: '加密传输',
      desc: '所有数据通过TLS加密通道传输',
      color: '#2563eb',
    },
    {
      icon: 'ri:shield-check-line',
      title: '加密存储',
      desc: '用户信息采用AES-256加密存储',
      color: '#059669',
    },
    {
      icon: 'ri:phone-lock-line',
      title: '隐私号码',
      desc: '支持隐藏真实号码，虚拟号沟通',
      color: '#7c3aed',
    },
    {
      icon: 'ri:secure-payment-line',
      title: '安全认证',
      desc: '微信生态认证，安全有保障',
      color: '#d97706',
    },
  ]

  function toggleFaq(index) {
    faqList.value[index].expanded = !faqList.value[index].expanded
  }
</script>

<style lang="scss" scoped>
  .intro-page {
    background: #ffffff;
  }

  /* ====== Hero 区域 ====== */
  .hero-section {
    padding: 60px 24px 40px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -60%;
      right: -30%;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -40%;
      left: -20%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-icon-wrap {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    backdrop-filter: blur(10px);
  }

  .hero-title {
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 8px;
  }

  .hero-subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 16px;
    font-weight: 500;
  }

  .hero-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    text-align: center;
    max-width: 300px;
    margin-bottom: 28px;
  }

  .hero-stats {
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 16px 20px;
    backdrop-filter: blur(10px);
    width: 100%;
    max-width: 340px;
  }

  .hero-stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-stat-num {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 2px;
  }

  .hero-stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
  }

  .hero-stat-divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.25);
  }

  /* ====== 通用 Section ====== */
  .section {
    padding: 32px 16px;
  }

  .section-header {
    margin-bottom: 24px;
    text-align: center;
  }

  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    display: block;
    margin-bottom: 6px;
  }

  .section-subtitle {
    font-size: 13px;
    color: #9ca3af;
    display: block;
  }

  /* ====== 功能卡片 ====== */
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .feature-card {
    background: #ffffff;
    border-radius: 18px;
    padding: 20px 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.97);
    }
  }

  .feature-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 6px;
  }

  .feature-desc {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }

  /* ====== 优势亮点 ====== */
  .advantage-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .advantage-card {
    display: flex;
    gap: 14px;
    background: #ffffff;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .advantage-index {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .advantage-index-text {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
  }

  .advantage-content {
    flex: 1;
  }

  .advantage-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    display: block;
    margin-bottom: 6px;
  }

  .advantage-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    display: block;
    margin-bottom: 10px;
  }

  .advantage-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .advantage-point {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .advantage-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .advantage-point-text {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }

  /* ====== 使用流程 ====== */
  .flow-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 4px;
  }

  .flow-step {
    display: flex;
    gap: 14px;
  }

  .flow-step-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .flow-step-num {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flow-step-num-text {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
  }

  .flow-step-line {
    width: 2px;
    flex: 1;
    min-height: 30px;
    margin: 4px 0;
    opacity: 0.25;
  }

  .flow-step-card {
    flex: 1;
    background: #ffffff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 14px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .flow-step-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .flow-step-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .flow-step-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    display: block;
    margin-bottom: 10px;
  }

  .flow-step-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .flow-step-tag {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  /* ====== 常见问题 ====== */
  .faq-list {
    background: #ffffff;
    border-radius: 20px;
    padding: 6px 18px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .faq-item {
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }
  }

  .faq-question {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .faq-q-left {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
  }

  .faq-q-badge {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .faq-q-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    flex: 1;
    line-height: 1.5;
  }

  .faq-answer {
    margin-top: 12px;
    padding-left: 32px;
  }

  .faq-a-left {
    display: flex;
    gap: 10px;
  }

  .faq-a-badge {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .faq-a-text {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    flex: 1;
  }

  /* ====== 数据安全 ====== */
  .security-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .security-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .security-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    border-width: 1px;
    border-style: solid;
  }

  .security-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .security-desc {
    font-size: 11px;
    color: #9ca3af;
    line-height: 1.4;
  }
</style>
