import { Link } from 'react-router-dom'
import type { Car } from '../types'
import { gradientForModel } from '../pages/car/AddCarPage'
import './CarCard.css'

interface Props {
  car: Car
}

export default function CarCard({ car }: Props) {
  return (
    <Link to={`/cars/${car.id}`} className="car-card">
      <div className="car-card-top" style={{ background: gradientForModel(car.model) }}>
        <span className={`badge ${car.available ? 'badge-green' : 'badge-red'}`}>
          {car.available ? 'Available' : 'Rented'}
        </span>
      </div>
      <div className="car-card-body">
        <div className="car-card-header">
          <span className="car-card-model">{car.model}</span>
        </div>
        <div className="car-card-meta">
          <span>{car.year}</span>
          <span>·</span>
          <span>{car.location}</span>
          <span>·</span>
          <span>{car.mileage.toLocaleString()} mi</span>
        </div>
      </div>
      <div className="car-card-price">
        <span className="car-card-price-amount">${car.price}</span>
        <span className="car-card-price-unit">/day</span>
      </div>
    </Link>
  )
}
