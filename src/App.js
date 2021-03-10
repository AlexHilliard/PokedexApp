import axi from 'axios';
import { Component } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import PokemonCard from './PokemonCard';
import PokemonPage from './PokemonPage';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { ButtonGroup } from '@material-ui/core';
import { all as allPoke } from 'pokemon' ;
import similarity from 'string-similarity';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { pokemon: [], next: null, prev: null, count: 0, searchInput: "" };
    this.getPokemon = this.getPokemon.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onClickPrev = this.onClickPrev.bind(this);
    this.onChange = this.onChange.bind(this);

  }
  async componentDidMount() {
    this.setState({ pokemon: await this.getPokemon('/pokemon') });
  }
  async getPokemon(url) {
    const d = await (await axi.get(url)).data
    let pokemon;
    let next;
    let previous;
    let count;
    if (d.results) {
      pokemon = d.results;
      next = d.next;
      previous = d.previous;
      count = d.count;
    }
    else {
      pokemon = [d];
    }
    this.setState({
      next: next,
      prev: previous,
      count: count
    })
    if (pokemon) {
      this.forceUpdate()
      return await Promise.all(pokemon.map(async (poke, i) => {
        try {
          const pSprite = await (await axi.get(`/pokemon/${poke.name}`)).data.sprites.front_default
          if(pSprite)
          {return ({
            ...poke,
            sprite: pSprite
          });}
        }
        catch (e) {
          pokemon.splice(i, 1)
          return null;
        }
      }));
    }
  }
  async onClickPrev() {
    this.setState({
      pokemon: await this.getPokemon(this.state.prev)
    })
  }
  async onClickNext() {
    this.setState({
      pokemon: await this.getPokemon(this.state.next)
    })
  }

  async onChange(e) {
    this.setState({ searchInput: e.target.value });
    if(e.target.value == ""){
      this.setState({ pokemon: await this.getPokemon('/pokemon') });
      return;
    }
    let pokeRating = similarity.findBestMatch(e.target.value.toLowerCase(), allPoke());
    const autoCom = pokeRating.ratings.filter(rating => rating.rating > .25).sort((a, b) => {
     if(a.rating > b.rating){
       return -1;
     }
     else if(a.rating < b.rating){
       return 1;
     }
     else{
       return 0;
     }
    }).slice(0, 20);
    const pokemonResult = await Promise.all(autoCom.map(async i => {
      return (await this.getPokemon(`/pokemon/${i.target.toLowerCase().replace(" ", "-").replace(".", "").replace("♀", "-f").replace("♂", "-m").replace("'", "").replace(":", "")}`))[0]
    }))
    console.log(pokemonResult)
    
    this.setState({ pokemon: pokemonResult });
  }

  createPagination() {
    let pagination = [];
    for (let i = 0; i < Math.ceil(this.state.count / 20); i++) {
      pagination.push(<Button
        variant="contained"
        key={i}
        onClick={async () => {
          this.setState({ pokemon: await this.getPokemon(`/pokemon?offset=${i * 20}&limit=20`) });
        }}
      >
        {i + 1}
      </Button>);
    }
    return pagination;
  }


  render() {
    return (
      <>
        <Router>
            <header id="nav1" style={{display: "grid", gridTemplateColumns: "max-content auto"}}>
              <img style={{height: "75px", alignContent: "right"}} src="/HomeText.png"/>
              <div id="nav2" style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", alignText: "right"}}>
                <input class="searchBar" style={{marginRight: "0.5%"}} type='search' placeholder="Search Here" onChange={this.onChange} />
              </div>
            </header>
          
          <Switch>
            <Route path="/pokemon/:pokemonName" component={PokemonPage} />
            <Route exact path="/">
              <div style={{margin: "2%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "25px" }}>
                {
                  this.state.pokemon?.map(poke => {
                    if (poke || poke?.sprite) {
                      return (
                        <PokemonCard {...poke} key={poke?.name} />
                      );
                    }
                    else {
                      return null;
                    }
                  })
                }
              </div>
              <div style={{ display: "flex", margin: "2%", justifyItems: "center", alignContent: "center", justifyContent: "center" }}>
                <ButtonGroup color="primary" aria-label="outlined primary button group">
                  {
                    this.state.prev ? <Button
                      variant="contained"
                      startIcon={<ArrowBackIosIcon />}
                      onClick={this.onClickPrev}
                    >
                      Prev
              </Button> : null
                  }

                  {
                    this.createPagination().map((page, index) => index % 3 === 0 ? page : null)
                  }
                    <Button
                      variant="contained"
                      key={Math.ceil(this.state.count / 20) -1}
                      onClick={async () => {
                        this.setState({ pokemon: await this.getPokemon(`/pokemon?offset=${(Math.ceil(this.state.count / 20) -1) * 20}&limit=20`) });
                      }}
                    >
                      {Math.ceil(this.state.count / 20)}
                    </Button>
                  {
                    this.state.next ? <Button
                      variant="contained"
                      endIcon={<ArrowForwardIosIcon />}
                      onClick={this.onClickNext}
                    >
                      Next
              </Button> : null
                  }
                </ButtonGroup>
              </div>
            </Route>
          </Switch>
        </Router>
      </>
    );
  }
}
