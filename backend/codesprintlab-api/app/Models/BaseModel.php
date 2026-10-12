<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseModel extends EloquentModel
{
    /**
     * Always include id and _id in serialization for compatibility with frontend and MongoDB queries.
     */
    protected $appends = ['id', '_id'];

    /**
     * Get string representation of id.
     */
    public function getIdAttribute($value = null)
    {
        return isset($this->attributes['id']) ? (string) $this->attributes['id'] : ($value ? (string) $value : null);
    }

    /**
     * Get _id alias attribute for MongoDB compatibility.
     */
    public function getUnderscoreIdAttribute()
    {
        return isset($this->attributes['id']) ? (string) $this->attributes['id'] : null;
    }

    /**
     * Override newEloquentBuilder to automatically translate '_id' column queries to 'id'.
     */
    public function newEloquentBuilder($query)
    {
        return new class($query) extends Builder {
            public function where($column, $operator = null, $value = null, $boolean = 'and')
            {
                if ($column === '_id' || $column === ($this->model->getTable() . '._id')) {
                    $column = $this->model->getTable() . '.id';
                }
                return parent::where($column, $operator, $value, $boolean);
            }

            public function whereIn($column, $values, $boolean = 'and', $not = false)
            {
                if ($column === '_id' || $column === ($this->model->getTable() . '._id')) {
                    $column = $this->model->getTable() . '.id';
                }
                return parent::whereIn($column, $values, $boolean, $not);
            }

            public function whereNotIn($column, $values, $boolean = 'and')
            {
                if ($column === '_id' || $column === ($this->model->getTable() . '._id')) {
                    $column = $this->model->getTable() . '.id';
                }
                return parent::whereNotIn($column, $values, $boolean);
            }
        };
    }
}
