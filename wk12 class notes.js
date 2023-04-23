import "wk12 class notes.css";
import axios from "axios";
(async function () {
  const API_URL = "https://rickandmortyapi.com/api/character";
  let characters = [];
  let episodeId = 1;
  const select = document.querySelector("#dropdown");
  const mockServer = {
    episodes: [],
    createEpisode(episode) {
      return new Promise((resolve, reject) => {
        episode.id = episodeId++;
        this.episodes.push(episode);
        resolve(episode);
      });
    },
    getEpisodes() {
      return new Promise((resolve, reject) => {
        resolve(this.episodes);
      });
    }
  };

  async function getCharacters() {
    try {
      const response = await axios.get(API_URL);
      characters = response.data.results;
      return characters;
    } catch (error) {
      const errorAlert = document.createElement("div");
      errorAlert.classList.add("alert", "alert-danger");
      errorAlert.textContent = "Error Getting Characters";
      document.body.appendChild(errorAlert);
      return [];
    }
  }
  getCharacters();

  async function displayImage(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      console.log(response);
      const character = response.data;
      document.querySelector("#title-head").innerHTML = character.name;
      document.querySelector("#get-schwifty").src = character.image;
      document.querySelector(
        "#photo-caption"
      ).innerHTML = `${character.name} from Rick and Morty`;
    } catch (error) {
      const errorAlert = document.createElement("div");
      errorAlert.classList.add("alert", "alert-danger");
      errorAlert.textContent = "Error Adding an Image";
      document.body.appendChild(errorAlert);
      return [];
    }
  }

  async function populateDropDown() {
    characters = await getCharacters();
    characters.forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.text = character.name;
      select.add(option);
    });
  }

  document
    .querySelector("#toggle-form-btn")
    .addEventListener("click", function () {
      const formContainer = document.querySelector("#form-container");
      if (formContainer.style.display === "none") {
        formContainer.style.display = "block";
      } else {
        formContainer.style.display = "none";
      }
    });

  select.addEventListener("change", async function () {
    const selectedCharacterId = this.value;
    await displayImage(selectedCharacterId);
  });

  async function populateDropdownWithEpisodes() {
    try {
      const select = document.querySelector("#dropdown");
      select.innerHTML = " ";
      await mockServer.getEpisodes();
      characters.forEach((character) => {
        const option = document.createElement("option");
        option.value = character.id;
        option.text = character.name;
        select.add(option);
      });
    } catch (error) {}
  }

  async function createEpisode(name, image) {
    try {
      const episode = { name, image };
      const createEpisode = await mockServer.createEpisode(episode);
      characters.push(createEpisode);
      populateDropdownWithEpisodes();
    } catch (error) {
      const errorAlert = document.createElement("div");
      errorAlert.classList.add("alert", "alert-danger");
      errorAlert.textContent = "Error Adding an Image";
      document.body.appendChild(errorAlert);
    }
  }
  function deleteCharacter() {
    select.remove(select.selectedIndex);
    document.querySelector("#title-head").innerHTML = "Character Deleted";
    document.querySelector("#get-schwifty").src = " ";
    document.querySelector("#photo-caption").innerHTML = " ";
  }

  document
    .querySelector("#create-form")
    .addEventListener("submit", async function (event) {
      console.log("form submission");
      event.preventDefault();
      const name = document.querySelector("#name").value;
      const image = document.querySelector("#image").value;
      const episode = await createEpisode(name, image);
    });

  document.querySelector("#delete-btn").addEventListener("click", function () {
    const selectedCharacterId = select.value;
    deleteCharacter(selectedCharacterId);
  });

  populateDropDown();
})();
