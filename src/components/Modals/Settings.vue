<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <ModalBase class="settings-modal" title="Settings" @close="$emit('close')">
    <div class="settings">
      <p>
        <label class="input-text">
          North Axis
          <input
            type="text"
            v-model.number.lazy="northAxis"
            :disabled="mapEnabled"
          />
        </label>
      </p>
      <ExpandableDrawer title="Ground Properties" class="ground-props-drawer">
        <p>
          <label class="input-text">
            Floor Offset
            <Info>
              Specifies the vertical offset between the building floor and the
              ground plane. Use a value &lt; 0 for buildings with below-grade
              spaces, or a value &gt; 0 for, e.g., buildings on piers.
            </Info>
            <input type="text" v-model="floor_offset" />
          </label>
        </p>
        <p>
          <label class="input-text">
            Azimuth Angle
            <Info>
              Direction of the ground plane, in clockwise degrees from the
              positive y-axis when viewed from above.
            </Info>
            <input type="text" v-model="azimuth_angle" />
          </label>
        </p>
        <p>
          <label class="input-text">
            Tilt Slope
            <Info>
              Slope of the ground plane from horizontal. For example, a value of
              1 implies a 45&deg; angle.
            </Info>
            <input type="text" v-model="tilt_slope" />
          </label>
        </p>
      </ExpandableDrawer>
      <button class="button" @click="$emit('close')">Okay</button>
    </div>
  </ModalBase>
</template>
<script>
import { mapState } from "vuex";
import ModalBase from "./ModalBase.vue";
import Info from "../Info.vue";
import ExpandableDrawer from "../ExpandableDrawer.vue";

export default {
  name: "Settings",
  emits: ["close"],
  computed: {
    ...mapState({
      ground: (state) => state.project.ground,
      mapEnabled: (state) => state.project.map.enabled,
    }),
    floor_offset: {
      get() {
        return this.ground.floor_offset;
      },
      set(val) {
        this.$store.dispatch("project/modifyGround", {
          key: "floor_offset",
          val,
        });
      },
    },
    azimuth_angle: {
      get() {
        return this.ground.azimuth_angle;
      },
      set(val) {
        this.$store.dispatch("project/modifyGround", {
          key: "azimuth_angle",
          val,
        });
      },
    },
    tilt_slope: {
      get() {
        return this.ground.tilt_slope;
      },
      set(val) {
        this.$store.dispatch("project/modifyGround", {
          key: "tilt_slope",
          val,
        });
      },
    },
    northAxis: {
      get() {
        return `${this.$store.state.project.north_axis}°`;
      },
      set(northAxis) {
        this.$store.dispatch("project/setNorthAxis", { north_axis: northAxis });
      },
    },
  },
  components: {
    ModalBase,
    Info,
    ExpandableDrawer,
  },
};
</script>
<style lang="scss">
@import "./../../scss/config";
.settings-modal .modal {
  width: 260px;
}

.settings {
  margin: 0 auto;
  width: 200px;
  .input-text input {
    height: 20px;
    font-size: 16px;
    margin-left: auto;
    width: 30px;
  }

  .ground-props-drawer {
    .title {
      text-align: left;
    }
    border: grey 1px solid;
    border-radius: 5px;
    padding: 4px;
    padding-left: 10px;
    width: 210px;
    margin-left: -12px;
  }
}
</style>
