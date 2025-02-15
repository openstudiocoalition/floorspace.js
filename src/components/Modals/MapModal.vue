<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <aside>
    <div class="overlay"></div>
    <div class="modal">
      <header>
        <h2>Quickstart</h2>
      </header>
      <NonChromeWarning />
      <div class="content">
        <p>
          <a
            @click="
              mapEnabled = false;
              mapVisible = false;
              $emit('close');
            "
            class="quickstart-action new-floorplan"
          >
            <div class="title">New</div>
            <QuickstartIconNewFloorplan />
            <div class="explanation">Create a new floorplan</div>
          </a>
        </p>
        <p>
          <a
            @click="
              mapEnabled = true;
              tool = 'Map';
              $emit('close');
            "
            :disabled="!online"
            class="quickstart-action"
          >
            <div class="title">New With Map</div>
            <QuickstartIconNewMapFloorplan />
            <div class="explanation">Create a new floorplan with a map</div>
          </a>
        </p>
        <p>
          <a
            @click="$refs.importInput.click()"
            id="import"
            class="quickstart-action open-floorplan"
          >
            <div class="title">Open</div>
            <QuickstartIconOpenFloorplan />
            <div class="explanation">Open an existing floorplan</div>
          </a>
        </p>
        <input
          id="importInput"
          ref="importInput"
          @change="importFloorplanAsFile"
          type="file"
        />
      </div>
    </div>
  </aside>
</template>

<script>
import svgs from "../svgs";
import NonChromeWarning from "../NonChromeWarning.vue";

export default {
  name: "MapModal",
  emits: ["close"],
  data() {
    return {
      address: "",
    };
  },
  computed: {
    online() {
      return window.api && window.api.config ? window.api.config.online : true;
    },
    mapEnabled: {
      get() {
        return this.$store.state.project.map.enabled;
      },
      set(enabled) {
        this.$store.dispatch("project/setMapEnabled", { enabled });
      },
    },
    tool: {
      get() {
        return this.$store.state.application.currentSelections.tool;
      },
      set(val) {
        this.$store.dispatch("application/setCurrentTool", { tool: val });
      },
    },
  },
  methods: {
    importFloorplanAsFile(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          this.importFloorplan(reader.result);
        },
        false
      );

      if (file) {
        reader.readAsText(file);
      }
    },
    importFloorplan(data) {
      this.$store.dispatch("importFloorplan", {
        clientWidth: document.getElementById("svg-grid").clientWidth,
        clientHeight: document.getElementById("svg-grid").clientHeight,
        data: JSON.parse(data),
      });
      this.$emit("close");
    },
  },
  components: {
    ...svgs,
    NonChromeWarning,
  },
};
</script>

<style lang="scss" scoped>
@import "./../../scss/config";

.modal {
  width: 35rem;
  background: #cccccc;
  header h2 {
    font-weight: bold;
  }

  .content {
    margin: 0 2rem 2rem 2rem;
    text-align: center;
    display: flex;
    justify-content: space-around;

    button {
      margin: 1rem 0.5rem;
    }

    input[type="file"] {
      display: none;
    }

    .explanation {
      color: #5d5d5d;
    }
    .title {
      color: #5d5d5d;
      text-transform: uppercase;
      font-weight: bold;
      margin-top: 2rem;
    }
  }
}

.quickstart-action {
  margin: auto;
  svg {
    height: 4rem;
    width: 4rem;
  }
}
</style>
