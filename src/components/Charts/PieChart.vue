<script lang="ts">
import { defineComponent, onMounted, watch, ref, PropType } from 'vue';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default defineComponent({
  name: 'PieChart',
  props: {
    chartData: {
      type: Object as PropType<ChartData<'pie'>>,
      required: true
    },
    options: {
      type: Object as PropType<ChartOptions<'pie'>>,
      default: () => ({})
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    const createChart = () => {
      if (chartCanvas.value) {
        chart = new Chart(chartCanvas.value, {
          type: 'pie',
          data: props.chartData,
          options: props.options
        });
      }
    };

    const updateChart = () => {
      if (chart) {
        chart.data = props.chartData;
        chart.options = props.options;
        chart.update();
      }
    };

    onMounted(() => {
      createChart();
    });

    watch(() => props.chartData, () => {
      updateChart();
    }, { deep: true });

    watch(() => props.options, () => {
      updateChart();
    }, { deep: true });

    return {
      chartCanvas
    };
  }
});
</script>