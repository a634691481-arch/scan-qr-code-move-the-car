<template>
  <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
    <view class="page-content">
      <!-- 统计卡片区域 -->
      <view class="stats-grid">
        <view class="stat-card" :style="statCard1Style">
          <view class="stat-icon-wrap" :style="{ background: 'rgba(255,255,255,0.2)' }">
            <yy-icon name="ri:car-line" size="22" color="#ffffff" />
          </view>
          <text class="stat-num">{{ stats.carCount }}</text>
          <text class="stat-label">绑定车辆</text>
        </view>

        <view class="stat-card" :style="statCard2Style">
          <view class="stat-icon-wrap" :style="{ background: 'rgba(255,255,255,0.2)' }">
            <yy-icon name="ri:phone-line" size="22" color="#ffffff" />
          </view>
          <text class="stat-num">{{ stats.contactCount }}</text>
          <text class="stat-label">联系他人</text>
        </view>

        <view class="stat-card" :style="statCard3Style">
          <view class="stat-icon-wrap" :style="{ background: 'rgba(255,255,255,0.2)' }">
            <yy-icon name="ri:qr-scan-line" size="22" color="#ffffff" />
          </view>
          <text class="stat-num">{{ stats.beContactedCount }}</text>
          <text class="stat-label">被联系次数</text>
        </view>

        <view class="stat-card" :style="statCard4Style">
          <view class="stat-icon-wrap" :style="{ background: 'rgba(255,255,255,0.2)' }">
            <yy-icon name="ri:calendar-check-line" size="22" color="#ffffff" />
          </view>
          <text class="stat-num">{{ stats.monthContactCount }}</text>
          <text class="stat-label">本月联系</text>
        </view>
      </view>

      <!-- 本周联系趋势 -->
      <view class="chart-card">
        <view class="chart-header">
          <view class="chart-title-row">
            <yy-icon name="ri:bar-chart-box-line" size="18" :color="uni.$u.color.primary" />
            <text class="chart-title">近7天联系趋势</text>
          </view>
          <text class="chart-subtitle">本周联系 {{ stats.weekContactCount }} 次</text>
        </view>

        <!-- 柱状图 -->
        <view class="bar-chart">
          <view v-for="(item, index) in stats.dailyTrend" :key="index" class="bar-item">
            <view class="bar-track">
              <view
                class="bar-fill"
                :style="{
                  height: getBarHeight(item.count) + '%',
                  background: uni.$u.color.primary,
                }"
              ></view>
            </view>
            <text class="bar-label">{{ item.label }}</text>
            <text class="bar-value">{{ item.count }}</text>
          </view>
        </view>
      </view>

      <!-- 最常联系的车牌 TOP5 -->
      <view class="rank-card">
        <view class="chart-header">
          <view class="chart-title-row">
            <yy-icon name="ri:trophy-line" size="18" :color="uni.$u.color.primary" />
            <text class="chart-title">最常联系的车牌</text>
          </view>
        </view>

        <view v-if="stats.topPlates.length > 0" class="rank-list">
          <view v-for="(item, index) in stats.topPlates" :key="index" class="rank-item">
            <view
              class="rank-num"
              :class="{ 'rank-num-top': index < 3 }"
              :style="index < 3 ? { background: rankColors[index] } : {}"
            >
              {{ index + 1 }}
            </view>
            <view class="rank-info">
              <text class="rank-plate">{{ item.plate }}</text>
              <view class="rank-progress-wrap">
                <view
                  class="rank-progress"
                  :style="{
                    width: getRankPercent(item.count) + '%',
                    background: index < 3 ? rankColors[index] : '#d1d5db',
                  }"
                ></view>
              </view>
            </view>
            <text class="rank-count">{{ item.count }}次</text>
          </view>
        </view>

        <view v-else class="empty-rank">
          <yy-icon name="ri:emotion-sad-line" size="32" color="#d1d5db" />
          <text class="empty-rank-text">暂无联系记录</text>
        </view>
      </view>

      <!-- 数据说明 -->
      <view class="tips-card">
        <view class="tips-header">
          <yy-icon name="ri:information-line" size="14" color="#9ca3af" />
          <text class="tips-title">数据说明</text>
        </view>
        <text class="tips-text">统计数据每日更新，"被联系次数"统计他人通过扫码或搜索您的车牌联系您的记录。</text>
      </view>

      <view style="height: 40rpx"></view>
    </view>
  </yy-paging>
</template>

<script setup>
  // ====== yy-paging 配置 ======
  const pagingConfig = ref({
    auto: false,
    refresherEnabled: true,
    showRefresherWhenReload: true,
    loadingMoreEnabled: false,
    showTabbar: false,
    hideNav: false,
    showNavBack: true,
    navTitle: '使用统计',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  // ====== 业务状态 ======
  const stats = ref({
    carCount: 0,
    contactCount: 0,
    beContactedCount: 0,
    monthContactCount: 0,
    weekContactCount: 0,
    dailyTrend: [],
    topPlates: [],
  })

  const rankColors = ['#f59e0b', '#9ca3af', '#b45309']

  const statCard1Style = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary}, ${uni.$u.color.primaryDark})`,
  }))

  const statCard2Style = computed(() => ({
    background: 'linear-gradient(135deg, #10b981, #059669)',
  }))

  const statCard3Style = computed(() => ({
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  }))

  const statCard4Style = computed(() => ({
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  }))

  onLoad(() => {
    loadStatistics()
  })

  onShow(() => {
    loadStatistics()
  })

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    await new Promise(resolve => setTimeout(resolve, 50))
    paging.value?.complete([1])
  }

  async function loadStatistics() {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      vk.toast('请先登录')
      return
    }

    vk.showLoading({ title: '加载中...', mask: true })

    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.getUserStatistics',
        data: { uid },
        needAlert: false,
      })

      vk.hideLoading()

      if (res.code === 0 && res.data) {
        stats.value = res.data
      } else {
        vk.toast(res.msg || '加载失败')
      }
    } catch (err) {
      vk.hideLoading()
      vk.toast(err.msg || '加载失败')
    }
  }

  // 计算柱状图高度百分比（最大值为100%）
  function getBarHeight(count) {
    const max = Math.max(...stats.value.dailyTrend.map(d => d.count), 1)
    return Math.max((count / max) * 100, 4)
  }

  // 计算排名进度条百分比
  function getRankPercent(count) {
    const max = Math.max(...stats.value.topPlates.map(p => p.count), 1)
    return Math.max((count / max) * 100, 4)
  }
</script>

<style lang="scss" scoped>
  .page-content {
    background: #f5f7fb;
    padding-bottom: 24rpx;
  }

  /* 统计网格 */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 16px 0;
  }

  .stat-card {
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .stat-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-num {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
  }

  /* 图表卡片 */
  .chart-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .chart-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chart-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
  }

  .chart-subtitle {
    font-size: 12px;
    color: #9ca3af;
  }

  /* 柱状图 */
  .bar-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    height: 140px;
    padding: 0 4px;
  }

  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bar-track {
    width: 100%;
    height: 100px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }

  .bar-fill {
    width: 100%;
    border-radius: 8px 8px 0 0;
    min-height: 4px;
    transition: height 0.5s ease;
  }

  .bar-label {
    font-size: 11px;
    color: #9ca3af;
  }

  .bar-value {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
  }

  /* 排名卡片 */
  .rank-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rank-num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
    flex-shrink: 0;
  }

  .rank-num-top {
    color: #ffffff;
  }

  .rank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rank-plate {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .rank-progress-wrap {
    height: 6px;
    background: #f3f4f6;
    border-radius: 3px;
    overflow: hidden;
  }

  .rank-progress {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .rank-count {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    flex-shrink: 0;
    min-width: 36px;
    text-align: right;
  }

  .empty-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 0;
  }

  .empty-rank-text {
    font-size: 13px;
    color: #9ca3af;
  }

  /* 提示卡片 */
  .tips-card {
    margin: 12px 16px 0;
    background: #ffffff;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .tips-title {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
  }

  .tips-text {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
  }
</style>
