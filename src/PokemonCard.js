import { useHistory } from "react-router-dom"
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    minWidth: '300px'
  });

const PokemonCard = props => {
    const classes = useStyles();
    const history = useHistory();
    console.log(props)
    return (
        <Card className={classes.root} onClick={() => {
            history.push(`/pokemon/${props.name}`)
        }}>
            <CardActionArea>
                <img
                    style={{aspectRatio:"1/1", width:"100%"}}
                    src={props.sprite}
                    title={props.name}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {props.name}
                    </Typography>
                </CardContent>
            </CardActionArea>

        </Card>
    );

}

export default PokemonCard;