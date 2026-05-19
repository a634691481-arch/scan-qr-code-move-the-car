<template>
  <z-paging
    ref="paging"
    :auto="auto"
    :bgColor="bgColor"
    v-model="list"
    fixed
    refresher-threshold="160rpx"
    @query="queryList"
    @onRefresh="onRefresh"
    @scrolltolower="scrolltolower"
    @scrollIntoViewById="scrollIntoViewById"
    @scrollToTop="scrollToTop"
    :useVirtualList="useVirtualList"
    :useInnerList="useInnerList"
    :cellKeyName="cellKeyName"
    :innerListStyle="innerListStyle"
    :cellHeightMode="cellHeightMode"
    :virtualScrollFps="virtualScrollFps"
    :show-refresher-when-reload="showRefresherWhenReload"
    :loading-more-enabled="loadingMoreEnabled"
    :use-page-scroll="usePageScroll"
    created-reload
    :preloadPage="preloadPage"
    :refresherEnabled="refresherEnabled"
    scroll-with-animation
    :auto-hide-loading-after-first-loaded="true"
    :loading-more-loading-text="{ en: '英文的加载中', 'zh-cn': '中文的加载中', 'zh-hant-cn': '繁体的加载中' }"
    :empty-view-center="false"
    loading-full-fixed
    show-refresher-update-time
    efresher-angle-enable-change-continued
    auto-show-back-to-top
    :safe-area-inset-bottom="false"
    :use-safe-area-placeholder="false"
  >
    <!-- refresher-vibrate -->
    <!--  -->
    <!-- auto-show-system-loading -->
    <!--  -->
    <!-- auto-show-system-loading-->
    <!-- loading-full-fixed -->
    <!-- show-refresher-update-time-->
    <!--  safe-area-inset-bottom -->
    <!--  use-safe-area-placeholder  -->
    <!-- loading-full-fixed -->
    <!-- auto-show-system-loading  -->
    <!-- show-refresher-when-reload -->
    <!-- :preloadPage="preloadPage" -->
    <!-- show-refresher-when-reload -->
    <!-- :show-loading-more-no-more-template="true" -->
    <!-- loading-full-fixed -->
    <!-- auto-show-system-loading -->
    <!-- system-loading-text="loading..." -->
    <!-- scroll-with-animation 在设置滚动条位置时使用动画过渡 -->
    <!-- inside-more 当分页未满一屏时，是否自动加载更多(nvue无效) -->
    <!-- show-refresher-update-time 是否显示最后更新时间   -->
    <!-- auto-show-back-to-top 自动显示点击返回顶部按钮 -->
    <!-- refresher-f2-enabled  是否开启二楼 -->
    <template #top>
      <!-- <u-navbar
          :background="{ backgroundColor: state.isScroll ? '#fff' : '#fff' }"
          :title="state.title"
          :border-bottom="false"
          title-color="#000"
          :isBack="false"
          backIconColor="#000"
        ></u-navbar> -->

      <u-navbar
        v-if="!hideNav"
        :is-back="showNavBack && !showTabbar"
        :title="navTitle"
        :background="navBackground"
        :is-fixed="true"
        :immersive="false"
        back-icon-name="arrow-leftward"
        title-width="350"
        :title-color="navTitleColor"
        :back-icon-color="backIconColor"
      ></u-navbar>
      <slot name="top" />
      <!---->
    </template>

    <template #bottom>
      <yy-tabbar v-if="showTabbar"></yy-tabbar>

      <slot name="bottom" />
    </template>
    <template #left>
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
    <template #loading>
      <!-- <yy-loading></yy-loading> -->
    </template>

    <template #empty>
      <!-- <slot name="empty" /> -->
      <yy-empty :text="emptyText"></yy-empty>
    </template>
    <template #cell="{ item, index }">
      <slot name="cell" :item="item" :index="index" />
    </template>
    <template #loadingMoreNoMore>
      <yy-nomore :text="loadingMoreNoMoreText"></yy-nomore>
    </template>
    <template #refresherF2>
      <view class="p-3">
        <view class="flex items-center justify-center p-1 text-white bg-gray-800 rounded-md">
          松手可以进入二楼哦 (*╹▽╹*)
        </view>
      </view>
    </template>

    <template #f2>
      <slot name="f2" />
    </template>
    <!-- <template #refresher="{ refresherStatus }">
      <tasi-refresher :status="refresherStatus" />
    </template> -->
    <slot />
  </z-paging>
</template>

<script setup>
  const emits = defineEmits(['onRefresh', 'query', 'update:modelValue', 'scrolltolower'])

  const props = defineProps({
    // 返回按钮颜色，默认 #000000
    backIconColor: {
      type: String,
      default: '#fff',
    },
    // 返回按钮颜色，默认 #fff
    navTitleColor: {
      type: String,
      default: '#fff',
    },
    // 空数据提示文字，默认 '暂无数据'
    emptyText: {
      type: String,
      default: '暂无数据',
    },
    // 加载更多无更多提示文字，默认 '没有更多了'
    loadingMoreNoMoreText: {
      type: String,
      default: '没有更多了',
    },

    // 是否关闭首次自动下拉刷新，默认 false（即默认开启）
    showRefresherWhenReload: {
      type: Boolean,
      default: false,
    },
    // 列表背景色，默认浅灰
    bgColor: {
      type: String,
      default: 'bg-gray-50 ',
      // default: 'var(--u-bg-white)',
    },
    // 是否启用“加载更多”功能，默认 true
    loadingMoreEnabled: {
      type: Boolean,
      default: true,
    },
    // v-model 绑定的列表数据（Vue 3 语法）
    modelValue: {
      type: Array,
      default: () => [],
    },
    // 请求失败时是否自动重试，默认 true
    retry: {
      type: Boolean,
      default: true,
    },
    // 是否使用页面级滚动（而非组件内部滚动），默认 false
    usePageScroll: {
      type: Boolean,
      default: false,
    },
    // 是否自动触发首次加载，默认 true
    auto: {
      type: Boolean,
      default: true,
    },
    // 是否启用虚拟列表，默认 false（大数据场景下开启）
    useVirtualList: {
      type: Boolean,
      default: false,
    },
    // 是否使用 z-paging 内置列表循环渲染；若开启虚拟列表，则此项恒为 true
    useInnerList: {
      type: Boolean,
      default: false,
    },
    // 内置列表 cell 的唯一 key 字段名，仅 nvue 有效，开启 use-inner-list 时必须指定
    cellKeyName: {
      type: String,
      default: '',
    },
    // 自定义内置列表的样式对象
    innerListStyle: {
      type: Object,
      default: () => ({}),
    },
    // 预加载页数（可视区域高度的倍数），默认 10 页
    preloadPage: {
      type: [Number, String],
      default: 10,
    },
    // 虚拟列表 cell 高度模式：'fixed' 固定高度，'dynamic' 动态高度
    cellHeightMode: {
      type: String,
      default: 'fixed',
    },
    // 虚拟列表滚动采样帧率，默认 60 帧
    virtualScrollFps: {
      type: [Number, String],
      default: 60,
    },
    // refresher-enabled
    refresherEnabled: {
      type: Boolean,
      default: true,
    },
    showTabbar: {
      type: Boolean,
      default: false,
    },
    // 是否隐藏导航栏，默认 false（显示导航栏）
    hideNav: {
      type: Boolean,
      default: false,
    },
    // 是否显示导航栏返回按钮，默认 false
    showNavBack: {
      type: Boolean,
      default: false,
    },
    // 导航栏标题
    navTitle: {
      type: String,
      default: '',
    },
    // 导航栏背景配置
    navBackground: {
      type: Object,
      default: () => ({
        backgroundColor: 'var(--u-type-primary)',
        // backgroundImage: 'linear-gradient(90deg, var(--u-type-primary-dark), var(--u-type-primary-disabled))',
      }),
    },
  })

  const paging = ref(null)
  const list = ref([])

  // 父 -> 子 同步：监听 modelValue，初始化与同步到内部 list
  watch(
    () => props.modelValue,
    newVal => {
      list.value = newVal || []
    },
    { immediate: true },
  )

  // 子 -> 父 同步：内部 list 变化时，触发 update:modelValue
  watch(
    () => list.value,
    newVal => {
      emits('update:modelValue', newVal)
    },
  )

  // 监听z-paging的@query事件，通过emit传递给页面
  const queryList = (pageNo, pageSize) => {
    emits('query', pageNo, pageSize)
  }

  const onRefresh = (pageNo, pageSize) => {
    emits('onRefresh', pageNo, pageSize)
  }
  const scrolltolower = (pageNo, pageSize) => {
    emits('scrolltolower', pageNo, pageSize)
  }

  const scrollIntoViewById = (x, y, z) => {
    paging.value.scrollIntoViewById(x, y, z)
  }

  // 接收页面触发的setLocalPaging方法，传给z-paging
  const setLocalPaging = data => {
    paging.value.setLocalPaging(data)
  }

  // 接收页面触发的reload方法，传给z-paging
  const reload = data => {
    paging.value.reload(data)
  }

  // 接收页面触发的complete方法，传给z-paging
  const complete = data => {
    paging.value.complete(data)
  }
  // 接收页面触发的refresh方法，传给z-paging
  const refresh = data => {
    paging.value.refresh(data)
  }

  // 如果是使用页面滚动，则需要添加以下三个方法
  const updatePageScrollTop = data => {
    paging.value.updatePageScrollTop(data)
  }

  const pageReachBottom = () => {
    paging.value.pageReachBottom()
  }

  const doChatRecordLoadMore = () => {
    paging.value.doChatRecordLoadMore()
  }
  const scrollToTop = () => {
    paging.value.scrollToTop()
  }

  defineExpose({ reload, complete, scrollIntoViewById, refresh, setLocalPaging, scrollToTop })
</script>

<style lang="scss" scoped>
  // .yy-paging-container {
  //   background-color: $u-bg-white;
  //   color: $u-main-color;
  // }
</style>
