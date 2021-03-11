import axi from "axios";
import { Component } from "react";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PropTypes from 'prop-types'
import { LinearProgress } from "@material-ui/core";
import PokemonCard from "./PokemonCard";

const styles = ((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

class PokemonPage extends Component {
  constructor(props) {
    super(props);
    this.state = { pokemon: null };
    this.getPokemon = this.getPokemon.bind(this);
  }

  async componentDidMount() {
    this.setState({ pokemon: await this.getPokemon() });
    
  }

  twoTypeDamage(type1, type2) {
    let comHalf = [...type1?.half_damage_from?type1.half_damage_from:[], ...type2?.half_damage_from?type2.half_damage_from:[]].filter((item, pos, self) => { 
      return !pos || item != self[pos - 1]
    })
    let comDouble = [...type1?.double_damage_from?type1.double_damage_from:[], ...type2?.double_damage_from?type2.double_damage_from:[]].filter((item, pos, self) => { 
      return !pos || item != self[pos - 1]
    })

    let tempResultHalf = comHalf.filter((e) => {
      return (!comDouble.some(b => b.name == e.name))
    })

    let tempResultDouble = comDouble.filter((e) => {
      return (!comHalf.some(b => b.name == e.name))
    })
    
    return[tempResultHalf, tempResultDouble];
  }

  genderRound(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  travelChain(evoChain, result) {
    if (evoChain?.evolves_to) {
      const html = <li key={evoChain.species.name}>{evoChain.species.name}</li>;
      result.push(html);
      evoChain.evolves_to.forEach(c => { this.travelChain(c, result) });
    }
  }

  async getPokemon() {
    let pokemon = await (await axi.get(`/pokemon/${this.props.match.params.pokemonName}`)).data;
    pokemon.species = await (await axi.get(`/pokemon-species/${this.props.match.params.pokemonName}`)).data;
    pokemon.species.evolution_chain = await (await axi.get(pokemon.species.evolution_chain.url)).data;
    pokemon.types = await Promise.all(pokemon.types.map(async type => {
      return await (await axi.get(type.type.url)).data;
    }))
    if (pokemon) {
      this.forceUpdate()
      const pSprite = await (await axi.get(`/pokemon/${pokemon.name}`)).data.sprites.front_default
      return ({
        ...pokemon,
        sprite: pSprite
      });
    }

  }


  render() {
    const toLocalUpper = txt => {
      if(txt){
          return txt.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      }
  };
    const { classes } = this.props;
    const gender = this.state.pokemon?.species.gender_rate;
    let result = []
    let halfDamage = []
    let doubleDamage = []
    if (this.state.pokemon?.species.evolution_chain) this.travelChain(this.state.pokemon?.species.evolution_chain.chain, result)
    if (this.state.pokemon?.types?.length == 1) {
      halfDamage = this.state.pokemon?.types[0].damage_relations?.half_damage_from.map(hd => {
        return <li>{hd.name}</li>
      })
    }
    else {
      const results = this.twoTypeDamage(this.state.pokemon?.types[0].damage_relations, this.state.pokemon?.types[1].damage_relations)
      halfDamage = results[0].map(r => {return <li>{toLocalUpper(r.name)}</li>});
      doubleDamage = results[1].map(r => {return <li>{toLocalUpper(r.name)}</li>});
    }
    if (this.state.pokemon?.types?.length == 1) {
      doubleDamage = this.state.pokemon?.types[0].damage_relations?.double_damage_from.map(dd => {
        return <li>{dd.name}</li>
      })
    }
    return (
      <div className={classes.root}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>General Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PokemonCard {...this.state.pokemon} />
            <ul>
              <li>National Dex number: {this.state.pokemon?.id}</li>
              <li>Height: {this.state.pokemon?.height / 10} m</li>
              <li>Weight: {this.state.pokemon?.weight / 10} kg</li>
              {this.state.pokemon?.abilities.map(({ ability: ability }) => {
                return <li key={ability.name}>Ability: {ability.name}</li>
              })}
            </ul>

          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Base Stats</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              <li>HP: {this.state.pokemon?.stats[0].base_stat}</li>
              <li>Attack: {this.state.pokemon?.stats[1].base_stat}</li>
              <li>Defense: {this.state.pokemon?.stats[2].base_stat}</li>
              <li>Sp. Atk: {this.state.pokemon?.stats[3].base_stat}</li>
              <li>Sp. Def: {this.state.pokemon?.stats[4].base_stat}</li>
              <li>Speed: {this.state.pokemon?.stats[5].base_stat}</li>
            </ul>

          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Types Resisted</Typography>
          </AccordionSummary>
          <AccordionDetails>
              <ul>
                {halfDamage}
              </ul>
          </AccordionDetails>
        </Accordion><Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Types Weak Against</Typography>
          </AccordionSummary>
          <AccordionDetails>
              <ul>
                {doubleDamage}
              </ul>
          </AccordionDetails>
        </Accordion><Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Training</Typography>
          </AccordionSummary>
          <AccordionDetails>

            <ul>
              <li>Base EXP: {this.state.pokemon?.base_experience}</li>
              <li>Capture Rate: {this.state.pokemon?.species.capture_rate}</li>
              <li>Base Happiness: {this.state.pokemon?.species.base_happiness}</li>
              <li>Growth rate: {this.state.pokemon?.species.growth_rate.name}</li>
            </ul>

          </AccordionDetails>
        </Accordion><Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Breeding</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              {this.state.pokemon?.species.egg_groups.map((egg) => {
                return <li key={egg.name}>Egg Groups: {egg.name}</li>
              })}
              {gender != -1 ?
                (<><li>Female: {this.genderRound((gender / 8) * 100)}%</li>
                  <li>Male: {this.genderRound(((8 - gender) / 8) * 100)}%</li></>) : <li>Genderless</li>
              }

            </ul>
          </AccordionDetails>
        </Accordion><Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography className={classes.heading}>Evolutions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {console.log(result)}
            {<ul>{result}</ul>}
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }
}
PokemonPage.propTypes = {
  classes: PropTypes.object.isRequired
}
export default withStyles(styles)(PokemonPage)