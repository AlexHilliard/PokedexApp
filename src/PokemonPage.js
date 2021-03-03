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

    genderRound(num) {
      return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    travelChain(evoChain, result) {
       if(evoChain?.evolves_to){
          const html = <li key={evoChain.species.name}>{evoChain.species.name}</li>;
          result.push(html);
          evoChain.evolves_to.forEach(c=>{this.travelChain(c, result)});
       } 
    }

    async getPokemon() {
        let pokemon = await (await axi.get(`/pokemon/${this.props.match.params.pokemonName}`)).data;
        pokemon.species = await (await axi.get(`/pokemon-species/${this.props.match.params.pokemonName}`)).data;
        pokemon.species.evolution_chain = await (await axi.get(pokemon.species.evolution_chain.url)).data;
        pokemon.types = await Promise.all(pokemon.types.map(async type => {
          return await (await axi.get(type.type.url)).data;
        }))
        console.log(pokemon)
        if(pokemon){
          this.forceUpdate()
            const pSprite = await (await axi.get(`/pokemon/${pokemon.name}`)).data.sprites.front_default
            return ({
              ...pokemon,
              sprite: pSprite
            });
        }
    }
    

    render() {
        const{classes}=this.props;
        const gender = this.state.pokemon?.species.gender_rate;
        let result = []
        if(this.state.pokemon?.species.evolution_chain) this.travelChain(this.state.pokemon?.species.evolution_chain.chain, result)
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
                    <PokemonCard {...this.state.pokemon}/>
                      <ul>
                          <li>National Dex number: {this.state.pokemon?.id}</li>
                          <li>Height: {this.state.pokemon?.height}</li>
                          <li>Weight: {this.state.pokemon?.weight}</li>
                          {this.state.pokemon?.abilities.map(({ability:ability})=>{
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
                  <Typography className={classes.heading}>Damage Taken</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ul>
                      <li>Nor: </li>
                      <li>Fig: </li>
                      <li>Fly: </li>
                      <li>Poi: </li>
                      <li>Gro: </li>
                      <li>Roc: </li>
                      <li>Bug: </li>
                      <li>Gho: </li>
                      <li>Ste: </li>
                      <li>Fir: </li>
                      <li>Wat: </li>
                      <li>Gra: </li>
                      <li>Ele: </li>
                      <li>Psy: </li>
                      <li>Ice: </li>
                      <li>Dra: </li>
                      <li>Dar: </li>
                      <li>Fai: </li>
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
                  {this.state.pokemon?.species.egg_groups.map((egg)=>{
                            return <li key={egg.name}>Egg Groups: {egg.name}</li>
                          })}
                          {gender != -1?
                          (<><li>Female: {this.genderRound((gender / 8) * 100)}%</li>
                          <li>Male: {this.genderRound(((8 - gender) / 8) * 100)}%</li></>): <li>Genderless</li>
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
                      {<ul>{result}</ul>}
                </AccordionDetails>
              </Accordion>
            </div>
          );
    }
}
PokemonPage.propTypes={
    classes: PropTypes.object.isRequired
}
export default withStyles(styles)(PokemonPage)