<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import AppIcon from './AppIcon.vue'

/*
 * HTML recreation of the profile editor window ("档案编辑"), laid out like the real one:
 * pivot tabs (schedule / time table / subjects / adjustments), a tool strip, the schedule list
 * on the left, the lesson table in the middle and the subject picker on the right.
 */
defineProps<{ subjects: (number | null)[]; sel: number }>()
const { c } = useLocale()
</script>

<template>
  <div class="ew">
    <div class="ew__title">
      <img src="/logo.svg" alt="" width="16" height="16" />
      <span class="ew__name">{{ c.demo.editorTitle }}</span>
      <span class="wc">
        <i><AppIcon name="minus" :size="12" /></i>
        <i><AppIcon name="square" :size="11" /></i>
        <i data-t="close"><AppIcon name="close" :size="13" /></i>
      </span>
    </div>

    <div class="ew__head">
      <div class="ew__tabs">
        <span v-for="(t, i) in c.demo.tabs" :key="t" :class="{ on: i === 0 }">{{ t }}</span>
      </div>
      <div class="ew__tools">
        <span v-for="t in c.demo.tools" :key="t">{{ t }}</span>
      </div>
    </div>

    <div class="ew__body">
      <div class="ew__left">
        <div class="cmd"><span>＋ {{ c.demo.add }}</span><span>{{ c.demo.copy }}</span></div>
        <div v-for="(p, i) in c.demo.plans" :key="p.name" class="plan" :class="{ on: i === 0 }">
          <b>{{ p.name }}</b>
          <em v-for="t in p.tags" :key="t">{{ t }}</em>
        </div>
      </div>

      <div class="ew__right">
        <div class="cmd"><span v-for="t in c.demo.detailTools" :key="t">{{ t }}</span></div>
        <div class="ew__cols">
          <div class="tbl">
            <div class="trow th">
              <span class="chk">{{ c.demo.cols[0] }}</span>
              <span class="tm">{{ c.demo.cols[1] }}</span>
              <span class="sj">{{ c.demo.cols[2] }}</span>
            </div>
            <div v-for="(tm, i) in c.demo.times" :key="tm" class="trow" :class="{ sel: sel === i }" :data-t="`row-${i}`">
              <span class="chk"><i><AppIcon name="check" :size="11" /></i></span>
              <span class="tm">{{ tm }}</span>
              <span class="sj" :class="{ ph: subjects[i] == null }">
                {{ subjects[i] == null ? c.demo.choose : c.demo.picker[subjects[i] as number].f }}
              </span>
            </div>
          </div>
          <div class="pick">
            <h4>{{ c.demo.pickTitle }}</h4>
            <div class="pick__grid">
              <span v-for="(b, i) in c.demo.picker" :key="i" :data-t="`sub-${i}`">{{ b.s }}</span>
            </div>
            <label class="auto"><i><AppIcon name="check" :size="11" /></i>{{ c.demo.autoNext }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ew {
  width: 1000px;
  height: 560px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: #272727;
  border: 1px solid #4a4a4a;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  color: #fff;
  font-family: 'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.25;
  overflow: hidden;
  user-select: none;
}
.ew__title {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 10px;
  background: #202020;
  color: #c8c8c8;
  font-size: 12px;
}
.ew__name {
  flex: 1;
}
.wc {
  display: flex;
  height: 100%;
}
.wc i {
  width: 46px;
  display: grid;
  place-items: center;
  font-style: normal;
}
.ew__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 6px 14px 0;
  background: #202020;
  border-bottom: 1px solid #353535;
}
.ew__tabs {
  display: flex;
  gap: 22px;
  font-size: 21px;
  font-weight: 600;
  color: #8d8d8d;
}
.ew__tabs span {
  padding-bottom: 8px;
  position: relative;
}
.ew__tabs .on {
  color: #fff;
}
.ew__tabs .on::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 22px;
  height: 3px;
  border-radius: 3px;
  background: #4cc2ff;
}
.ew__tools {
  display: flex;
  gap: 18px;
  padding-bottom: 12px;
  font-size: 12px;
  color: #e6e6e6;
}
.ew__body {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 0;
}
.ew__left {
  border-right: 1px solid #353535;
  padding: 8px 10px;
  overflow: hidden;
}
.cmd {
  display: flex;
  gap: 22px;
  height: 36px;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  color: #e6e6e6;
}
.plan {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 10px;
  border-radius: 4px;
  position: relative;
}
.plan b {
  font-weight: 600;
  margin-right: 4px;
}
.plan em {
  font-style: normal;
  font-size: 11.5px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #343434;
}
.plan.on {
  background: #323232;
}
.plan.on::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 3px;
  background: #4cc2ff;
}
.ew__right {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 8px 0 0 10px;
}
.ew__cols {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 252px;
  min-height: 0;
}
.tbl {
  border-top: 1px solid #353535;
}
.trow {
  display: grid;
  grid-template-columns: 70px 150px 1fr;
  align-items: center;
  height: 36px;
  border-bottom: 1px solid #333;
  font-variant-numeric: tabular-nums;
}
.trow.th {
  height: 30px;
  font-size: 11px;
  color: #b0b0b0;
  background: #2d2d2d;
}
.trow .chk {
  padding-left: 14px;
}
.trow .chk i {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #6a6a6a;
  background: #3a3a3a;
}
.trow.th .chk {
  padding-left: 14px;
}
.trow .sj {
  padding-left: 6px;
}
.trow .sj.ph {
  color: #7a7a7a;
}
.trow.sel {
  background: #2f6f9f;
}
.pick {
  border-left: 1px solid #353535;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
}
.pick h4 {
  margin: 0 0 12px;
  font-size: 12.5px;
  font-weight: 600;
  display: inline-block;
  align-self: flex-start;
  padding-bottom: 3px;
  border-bottom: 2px solid #4cc2ff;
}
.pick__grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px 2px;
  font-size: 15px;
}
.pick__grid span {
  display: grid;
  place-items: center;
  height: 30px;
  border-radius: 4px;
  font-size: 14px;
}
.auto {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #e6e6e6;
}
.auto i {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #4cc2ff;
  color: #0a2540;
}
</style>
