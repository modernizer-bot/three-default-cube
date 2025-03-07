import Stats from 'three/examples/jsm/libs/stats.module';
import { AssetsService } from './assets-service';
import { MathService } from './math-service';
import { MoneyService } from './money-service';
import { RenderService } from './render-service';
import { StorageService } from './storage-service';
import { TimeService } from './time-service';
import { UtilsService } from './utils-service';
import { VarService } from './var-service';

const LogsNaturalColor = '#ffffff';
const LogsHighlightColor = '#ffff33';

export const DebugFlags = {
  DEBUG_ENABLE: 'DEBUG_ENABLE',
  DEBUG_LIVE: 'DEBUG_LIVE',
  DEBUG_LOG_MEMORY: 'DEBUG_LOG_MEMORY',
  DEBUG_LOG_POOLS: 'DEBUG_LOG_POOLS',
  DEBUG_LOG_ASSETS: 'DEBUG_LOG_ASSETS',
  DEBUG_ORBIT_CONTROLS: 'DEBUG_ORBIT_CONTROLS',
  DEBUG_SCROLL_VISIBLE: 'DEBUG_SCROLL_VISIBLE',
  DEBUG_TIME_LISTENERS: 'DEBUG_TIME_LISTENERS',
  DEBUG_SKINNING_SKELETONS: 'DEBUG_SKINNING_SKELETONS',
  DEBUG_ADS: 'DEBUG_ADS',
  DEBUG_DISABLE_ADS: 'DEBUG_DISABLE_ADS',
  DEBUG_STORAGE: 'DEBUG_STORAGE',
  DEBUG_AI_NODES: 'DEBUG_AI_NODES',
  DEBUG_AI_TARGETS: 'DEBUG_AI_TARGETS',
  DEBUG_PHYSICS: 'DEBUG_PHYSICS',
  DEBUG_PHYSICS_DYNAMIC: 'DEBUG_PHYSICS_DYNAMIC',
};

class DummyDebugClass {
  stats = null;
  logs = null;
  leaks = {
    textures: 0,
    geometries: 0,
  };
  flags = {};

  on(debugFlag) {
    this.flags[debugFlag] = true;
  }

  off(debugFlag) {
    this.flags[debugFlag] = false;
  }

  get(debugFlag) {
    return (this.flags['DEBUG_ENABLE'] && this.flags[debugFlag]) || false;
  }

  showStats() {
    const stats = new Stats();

    stats.showPanel(0);

    document.body.appendChild(stats.dom);

    this.stats = stats;

    TimeService.registerPersistentFrameListener(() => {
      this.stats.update();

      return !!this.stats;
    });
  }

  hideStats() {
    if (this.stats) {
      document.body.removeChild(this.stats.dom);
    }
  }

  showLogs() {
    const outputElement = document.createElement('div');
    outputElement.style.position = 'absolute';
    outputElement.style.top = '5px';
    outputElement.style.right = '5px';
    outputElement.style.display = 'inline-block';
    outputElement.style.overflow = 'hidden';
    outputElement.style.pointerEvents = 'none';
    outputElement.style.touchAction = 'none';
    outputElement.style.zIndex = Number.MAX_SAFE_INTEGER;
    outputElement.style.color = '#ffffff';
    outputElement.style.textShadow = '0px 0px 2px #000000';
    outputElement.style.textAlign = 'right';
    outputElement.style.background = 'rgba(0, 0, 0, 0.5)';
    outputElement.style.borderRadius = '5px';
    outputElement.style.padding = '5px';
    outputElement.style.userSelect = 'none';
    
    document.body.appendChild(outputElement);

    this.logs = outputElement;

    TimeService.registerPersistentFrameListener(() => {
      if (!this.logs) {
        return false;
      }

      const outputElement = this.logs;

      outputElement.innerHTML = '';

      if (this.get(DebugFlags.DEBUG_LOG_MEMORY)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Geometries:' },
          { text: RenderService.getRenderer().info.memory.geometries, color: LogsHighlightColor },
          { text: `(☒ ${this.leaks.geometries})`, color: LogsHighlightColor },
          { text: 'Textures:' },
          { text: RenderService.getRenderer().info.memory.textures, color: LogsHighlightColor },
          { text: `(☒ ${this.leaks.textures})`, color: LogsHighlightColor },
          { text: 'Materials:' },
          { text: Object.keys(AssetsService.savedMaterials).length, color: LogsHighlightColor },
        ));
        outputElement.appendChild(this.createLogLine(
          { text: 'Memory (%):' },
          { text: performance.memory.totalJSHeapSize, color: LogsHighlightColor },
          { text: `(${(performance.memory.totalJSHeapSize / performance.memory.jsHeapSizeLimit * 100.0).toFixed(0)}%)`, color: LogsHighlightColor },
        ));
      }

      if (this.get(DebugFlags.DEBUG_LOG_ASSETS)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Disposables:' },
          { text: AssetsService.disposables.length, color: LogsHighlightColor },
          { text: 'Preloaded:' },
          { text: Object.keys(AssetsService.preloaded).length, color: LogsHighlightColor },
          { text: 'Pending:' },
          { text: Object.keys(AssetsService.pending).length, color: LogsHighlightColor },
          { text: 'Audio: ' },
          { text: Object.keys(AssetsService.audioBuffers).length, color: LogsHighlightColor }
        ));
      }

      if (this.get(DebugFlags.DEBUG_LOG_POOLS)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Vec3:' },
          { text: MathService.poolVec3Total - MathService.poolVec3.length, color: LogsHighlightColor },
          { text: '/' },
          { text: MathService.poolVec3Total, color: LogsHighlightColor },
          { text: 'Vec2:' },
          { text: MathService.poolVec2Total - MathService.poolVec2.length, color: LogsHighlightColor },
          { text: '/' },
          { text: MathService.poolVec2Total, color: LogsHighlightColor },
          { text: 'Quat:' },
          { text: MathService.poolQuaternionsTotal - MathService.poolQuaternions.length, color: LogsHighlightColor },
          { text: '/' },
          { text: MathService.poolQuaternionsTotal, color: LogsHighlightColor }
        ));

        outputElement.appendChild(this.createLogLine(
          { text: 'RayC:' },
          { text: UtilsService.poolRaycasterTotal - UtilsService.poolRaycaster.length, color: LogsHighlightColor },
          { text: '/' },
          { text: UtilsService.poolRaycasterTotal, color: LogsHighlightColor },
          { text: 'Box3:' },
          { text: UtilsService.poolBox3Total - UtilsService.poolBox3.length, color: LogsHighlightColor },
          { text: '/' },
          { text: UtilsService.poolBox3Total, color: LogsHighlightColor },
          { text: 'Cam:' },
          { text: UtilsService.poolCameraTotal - UtilsService.poolCamera.length, color: LogsHighlightColor },
          { text: '/' },
          { text: UtilsService.poolCameraTotal, color: LogsHighlightColor }
        ));

        outputElement.appendChild(this.createLogLine(
          { text: 'Empt:' },
          { text: UtilsService.poolEmptyTotal - UtilsService.poolEmpty.length, color: LogsHighlightColor },
          { text: '/' },
          { text: UtilsService.poolEmptyTotal, color: LogsHighlightColor },
          { text: 'Mat:' },
          { text: UtilsService.poolBlankMaterialTotal - UtilsService.poolBlankMaterial.length, color: LogsHighlightColor },
          { text: '/' },
          { text: UtilsService.poolBlankMaterialTotal, color: LogsHighlightColor },
        ));
      }

      if (this.get(DebugFlags.DEBUG_TIME_LISTENERS)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Timed Fn.:' },
          { text: TimeService.frameListeners.length, color: LogsHighlightColor },
          { text: 'Pers. Timed:' },
          { text: Object.keys(TimeService.persistentFrameListeners).length, color: LogsHighlightColor },
          { text: 'Vars:' },
          { text: Object.keys(VarService.listeners).flatMap(key => VarService.listeners[key]).length, color: LogsHighlightColor }
        ));
      }

      if (this.get(DebugFlags.DEBUG_ADS)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Ads:' },
          { text: MoneyService.adsDisabled ? 'disabled' : 'enabled', color: LogsHighlightColor },
          { text: 'AdStat:' },
          { text: MoneyService.adsInitialised ? 'ok' : 'error', color: LogsHighlightColor },
        ));
      }

      if (this.get(DebugFlags.DEBUG_STORAGE)) {
        outputElement.appendChild(this.createLogLine(
          { text: 'Storage' },
          { text: 'Reads:' },
          { text: StorageService.reads, color: LogsHighlightColor },
          { text: 'Writes:' },
          { text: StorageService.writes, color: LogsHighlightColor },
        ));
      }
    });
  }

  createLogLine(...logs) {
    const logLineElement = document.createElement('div');

    logs.forEach(({ text, color }) => {
      const spanElement = document.createElement('span');
      spanElement.style.color = color || LogsNaturalColor;
      spanElement.style.margin = '0px 4px';

      spanElement.innerHTML = text;

      logLineElement.appendChild(spanElement);
    });

    return logLineElement;
  }
}

export const DummyDebug = new DummyDebugClass();