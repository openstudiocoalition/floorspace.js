import _ from "lodash";
import helpers from "./helpers";

export default {
  initStory(state, payload) {
    state.stories.push(payload.story);
  },
  initSpace(state, payload) {
    payload.story.spaces.push(payload.space);
  },
  initShading(state, payload) {
    payload.story.shading.push(payload.shading);
  },

  initObject(state, payload) {
    state.library[payload.type].push(payload.object);
  },

  /**
   * Modifies the state to create a new object and select it on the provided space
   * @param {*} state
   * @param {{ object: { space_id: number, type: string, type_id: string }}} payload
   * @returns
   */
  initObjectWithSelection(state, payload) {
    state.library[payload.type].push(payload.object);

    for (let story of state.stories) {
      for (let space of story.spaces) {
        if (space.id === payload.space_id) {
          space[payload.type_id] = payload.object.id;
          return;
        }
      }
    }
  },

  destroySpace(state, payload) {
    payload.story.spaces.splice(
      payload.story.spaces.findIndex((s) => {
        return s.id === payload.space.id;
      }),
      1
    );
  },
  destroyShading(state, payload) {
    payload.story.shading.splice(
      payload.story.shading.findIndex((s) => {
        return s.id === payload.shading.id;
      }),
      1
    );
  },
  destroyImage(state, payload) {
    payload.story.images.splice(
      payload.story.images.findIndex((i) => {
        return i.id === payload.image.id;
      }),
      1
    );
  },
  destroyStory(state, payload) {
    state.stories.splice(
      state.stories.findIndex((s) => {
        return s.id === payload.story.id;
      }),
      1
    );
  },
  destroyObject(state, { object: { id } }) {
    // search the library
    state.library = _.mapValues(state.library, (lst) => _.reject(lst, { id }));
  },

  updateStoryWithData(state, payload) {
    const story = payload.story;
    delete payload.story;
    Object.assign(story, payload);
  },
  createImageForStory(state, payload) {
    const story = state.stories.find((s) => s.id === payload.story_id);
    story.images.push(payload.image);
  },

  /**
   * Updates the basic data stored on the space
   * If the building type is changed, it will affect all other spaces in the same building unit
   * If the building unit is changed, it will change the type of the building to match all other spaces with that building unit
   *
   * @param {*} state State to update
   * @param {*} payload Payload with data fields to update on the space
   */
  updateSpaceWithData(state, payload) {
    const space = payload.space;

    if (payload.building_type_id && space.building_unit_id) {
      state.stories = state.stories.map((story) => {
        return {
          ...story,
          spaces: story.spaces.map((s) => {
            if (s.building_unit_id === space.building_unit_id) {
              return {
                ...s,
                building_type_id: payload.building_type_id,
              };
            } else {
              return s;
            }
          }),
        };
      });
    } else if (payload.building_unit_id) {
      let found = false;
      // Control iteration manually so break can be used for early exits
      for (let story of state.stories) {
        for (let space of story.spaces) {
          if (space.building_unit_id === payload.building_unit_id) {
            payload = {
              ...payload,
              building_type_id: space.building_type_id,
            };
            found = true;
            break;
          }
        }

        if (found) {
          break;
        }
      }
    }

    Object.assign(space, payload);
    delete space.space;
  },

  updateShadingWithData(state, payload) {
    const shading = payload.shading;
    Object.assign(shading, payload);
    delete shading.shading;
  },
  updateImageWithData(state, payload) {
    const image = payload.image;
    Object.assign(image, payload);
    delete image.image;
  },
  updateObjectWithData(state, payload) {
    const object = payload.object;
    Object.assign(object, payload);
    delete object.object;
  },
  createWindow(
    state,
    { story_id, edge_id, window_definition_id, alpha, id, name }
  ) {
    const story = _.find(state.stories, { id: story_id });
    story.windows.push({
      window_definition_id,
      edge_id,
      alpha,
      id,
      name,
    });
  },

  /**
   * Batched version of the `createWindow` mutation
   * @param {*} state
   * @param {*} payload Array of windows to be created
   */
  createWindows(state, payload) {
    const obj = {};
    payload.forEach(
      ({ story_id, edge_id, window_definition_id, alpha, id, name }) => {
        const window = {
          window_definition_id,
          edge_id,
          alpha,
          id,
          name,
        };
        if (obj[story_id]) {
          obj[story_id].push(window);
        } else {
          obj[story_id] = [window];
        }
      }
    );

    Object.entries(obj).forEach(([key, value]) => {
      const story = _.find(state.stories, { id: key });
      story.windows = story.windows.concat(value);
    });
  },
  createDoor(state, { story_id, edge_id, door_definition_id, alpha, id }) {
    const story = _.find(state.stories, { id: story_id });
    story.doors.push({
      door_definition_id,
      edge_id,
      alpha,
      id,
      name,
    });
  },

  /**
   * Batched version of the `createDoor` mutation
   * @param {*} state
   * @param {*} payload Array of doors to be created
   */
  createDoors(state, payload) {
    const obj = {};
    payload.forEach(({ story_id, edge_id, door_definition_id, alpha, id }) => {
      const door = {
        door_definition_id,
        edge_id,
        alpha,
        id,
        name,
      };
      if (obj[story_id]) {
        obj[story_id].push(door);
      } else {
        obj[story_id] = [door];
      }
    });

    Object.entries(obj).forEach(([key, value]) => {
      const story = _.find(state.stories, { id: key });
      story.doors = story.doors.concat(value);
    });
  },

  dropWindows(state, { story_id }) {
    const story = _.find(state.stories, { id: story_id });
    story.windows = [];
  },
  dropDoors(state, { story_id }) {
    const story = _.find(state.stories, { id: story_id });
    story.doors = [];
  },
  createDaylightingControl(
    state,
    {
      story_id,
      face_id,
      daylighting_control_definition_id,
      vertex_id,
      name,
      id,
    }
  ) {
    const story = _.find(state.stories, { id: story_id }),
      space = _.find(story.spaces, { face_id });

    space.daylighting_controls.push({
      daylighting_control_definition_id,
      vertex_id,
      id,
      name,
    });
  },
  dropDaylightingControls(state, { story_id }) {
    const story = _.find(state.stories, { id: story_id });
    story.spaces = story.spaces.map((space) => {
      if (space.daylighting_controls.length === 0) {
        return space;
      } else {
        return Object.assign({}, space, { daylighting_controls: [] });
      }
    });
  },
  destroyWindowsByDefinition(state, { id }) {
    state.stories.forEach((story) => {
      story.windows = _.reject(story.windows, { window_definition_id: id });
    });
  },
  destroyDaylightingControlsByDefinition(state, { id }) {
    state.stories.forEach((story) => {
      story.spaces.forEach((space) => {
        space.daylighting_controls = _.reject(space.daylighting_controls, {
          daylighting_control_definition_id: id,
        });
      });
    });
  },
  destroyDoorsByDefinition(state, { id }) {
    state.stories.forEach((story) => {
      story.doors = _.reject(story.doors, { door_definition_id: id });
    });
  },
  destroyDaylightingControl(state, { story_id, object: { id } }) {
    const story = _.find(state.stories, { id: story_id });
    story.spaces.forEach((space) => {
      space.daylighting_controls = _.reject(space.daylighting_controls, { id });
    });
  },
  modifyDaylightingControl(state, { story_id, id, key, value }) {
    const story = _.find(state.stories, { id: story_id });
    story.spaces.some((space) => {
      const dc = _.find(space.daylighting_controls, { id });
      if (dc) {
        dc[key] = value;
        return true;
      }
      // not on this space, maybe another?
      return false;
    });
  },
  destroyWindow(state, { story_id, object: { id } }) {
    const story = _.find(state.stories, { id: story_id });
    story.windows = _.reject(story.windows, { id });
  },
  destroyWindows(state, payload) {
    const obj = {};

    payload.forEach(({ story_id, object: { id } }) => {
      if (obj[story_id]) {
        obj[story_id].push(id);
      } else {
        obj[story_id] = [id];
      }
    });

    Object.entries(obj).forEach(([key, value]) => {
      const story = _.find(state.stories, { id: key });
      story.windows = story.windows.filter((window) => {
        return value.indexOf(window.id) === -1;
      });
    });
  },
  destroyDoor(state, { story_id, object: { id } }) {
    const story = _.find(state.stories, { id: story_id });
    story.doors = _.reject(story.doors, { id });
  },
  destroyDoors(state, payload) {
    const obj = {};

    payload.forEach(({ story_id, object: { id } }) => {
      if (obj[story_id]) {
        obj[story_id].push(id);
      } else {
        obj[story_id] = [id];
      }
    });

    Object.entries(obj).forEach(([key, value]) => {
      const story = _.find(state.stories, { id: key });
      story.doors = story.doors.filter((window) => {
        return value.indexOf(window.id) === -1;
      });
    });
  },
  modifyWindow(state, { story_id, id, key, value }) {
    const story = _.find(state.stories, { id: story_id }),
      windew = _.find(story.windows, { id });
    windew[key] = value;
  },
  modifyDoor(state, { story_id, id, key, value }) {
    const story = _.find(state.stories, { id: story_id }),
      door = _.find(story.doors, { id });
    door[key] = value;
  },
  cloneObjectArray(state, payload) {
    const newStory = state.stories.find(
      (story) => story.id === payload.currentStory.id
    );
    newStory["spaces"] = payload.storyInfo["spaces"];
    helpers.replaceSpaceNamesForCloning(state, "spaces", payload.currentStory);
    newStory["shading"] = payload.storyInfo["shading"];
    newStory["doors"] = payload.storyInfo["doors"];
    newStory["images"] = payload.storyInfo["images"];
    newStory["windows"] = payload.storyInfo["windows"];
  },
};
